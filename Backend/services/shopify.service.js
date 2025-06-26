const { Shopify } = require('@shopify/shopify-api');
const axios = require('axios');
const { product: Product, aiProductContent } = require('../models/product.model');
const { generateProductDetails } = require('./gemini.service');

class ShopifyService {
  constructor() {
    this.shopName = process.env.SHOPIFY_SHOP_NAME;
    this.storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;
    this.webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    this.graphqlClient = null;

    // Validate required environment variables
    const missingVars = [];
    if (!this.shopName) missingVars.push('SHOPIFY_SHOP_NAME');
    if (!this.storefrontToken) missingVars.push('SHOPIFY_STOREFRONT_TOKEN');
    if (!this.webhookSecret) missingVars.push('SHOPIFY_WEBHOOK_SECRET');

    if (missingVars.length > 0) {
      console.error('Missing required Shopify environment variables:', missingVars.join(', '));
      console.error('Please set these variables in your .env file');
    }
  }

  async initialize() {
    if (!this.shopName || !this.storefrontToken) {
      throw new Error('Missing required Shopify environment variables');
    }

    if (!this.graphqlClient) {
      try {
        const { GraphQLClient } = await import('graphql-request');
        const shopUrl = `https://${this.shopName}.myshopify.com`;
        const apiUrl = `${shopUrl}/api/2024-01/graphql.json`;
        
        console.log('Initializing GraphQL client with URL:', apiUrl);
        
        this.graphqlClient = new GraphQLClient(apiUrl, {
          headers: {
            'X-Shopify-Storefront-Access-Token': this.storefrontToken,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error initializing GraphQL client:', error);
        throw new Error('Failed to initialize Shopify client');
      }
    }
    return this.graphqlClient;
  }

  async fetchCollections() {
    try {
      const client = await this.initialize();
      const query = `
        query {
          collections(first: 10) {
            edges {
              node {
                id
                title
                description
                image {
                  url
                }
              }
            }
          }
        }
      `;

      console.log('Fetching collections from Shopify...');
      const response = await client.request(query);
      console.log('Collections response:', response);

      if (!response.collections?.edges) {
        throw new Error('Invalid response format from Shopify');
      }

      return response.collections.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        image: edge.node.image?.url
      }));
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }
  }

  async fetchProducts({ search, sort, page = 1, limit = 12, collectionId } = {}) {
    try {
      const client = await this.initialize();
      const first = limit;
      let queryString = '';
      if (search) {
        queryString += `title:*${search}* OR description:*${search}*`;
      }
      if (collectionId) {
        queryString += ` collection_id:${collectionId}`;
      }
      const query = `
        query($first: Int!, $query: String) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                handle
                title
                description
                priceRange { minVariantPrice { amount } }
                images(first: 1) { edges { node { url } } }
                tags
                variants(first: 1) { edges { node { id price { amount } } } }
              }
            }
          }
        }
      `;
      const variables = {
        first,
        query: queryString.trim() || undefined
      };
      const response = await client.request(query, variables);
      if (!response.products || !response.products.edges) {
        return [];
      }
      return response.products.edges.map(edge => ({
        id: edge.node.id,
        handle: edge.node.handle,
        title: edge.node.title,
        description: edge.node.description,
        price: edge.node.priceRange.minVariantPrice.amount,
        images: edge.node.images.edges.map(img => img.node.url),
        tags: edge.node.tags,
        variantId: edge.node.variants.edges[0]?.node.id,
        variantPrice: edge.node.variants.edges[0]?.node.price.amount
      }));
    } catch (error) {
      console.error('Error fetching products from Shopify:', error);
      if (error.response) {
        console.error('Shopify Error Response:', JSON.stringify(error.response, null, 2));
      }
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async fetchProduct(id) {
    try {
      const client = await this.initialize();
      const query = `
        query($id: ID!) {
          product(id: $id) {
            id
            title
            description
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                }
              }
            }
            tags
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                  }
                  availableForSale
                  quantityAvailable
                }
              }
            }
          }
        }
      `;

      console.log('Fetching product with ID:', id);
      const response = await client.request(query, { id });
      console.log('Product response:', response);

      const product = response.product;
      if (!product) {
        return null;
      }

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.variants.edges[0]?.node.price.amount || product.priceRange.minVariantPrice.amount,
        images: product.images.edges.map(edge => edge.node.url),
        tags: product.tags,
        variantId: product.variants.edges[0]?.node.id,
        availableForSale: product.variants.edges[0]?.node.availableForSale,
        quantityAvailable: product.variants.edges[0]?.node.quantityAvailable
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  async createCheckout(items, shippingAddress, email) {
    try {
      const client = await this.initialize();
      const query = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      const variables = {
        input: {
          lines: items.map(item => ({
            quantity: item.quantity,
            merchandiseId: item.variantId
          }))
        }
      };
      console.log('Creating cart with items:', items);
      const response = await client.request(query, variables);
      console.log('Cart create response:', response);
      const userErrors = response.cartCreate.userErrors;
      if (userErrors && userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }
      return {
        checkoutUrl: response.cartCreate.cart.checkoutUrl
      };
    } catch (error) {
      console.error('Error creating cart/checkout:', error);
      throw new Error(`Failed to create checkout: ${error.message}`);
    }
  }

  verifyWebhookSignature(rawBody, signature) {
    try {
      return Shopify.Utils.verifyWebhookSignature(
        rawBody,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  async fetchProductByHandle(handle) {
    // First, check local DB for aiContent and other fields
    const localProduct = await Product.findOne({ slug: handle }).lean();
    if (localProduct) {
      return {
        id: localProduct._id,
        handle: localProduct.slug,
        title: localProduct.title,
        description: localProduct.description,
        tags: [], // Add tags if you store them locally
        images: (localProduct.images || []).map(img => img.url || img),
        price: localProduct.price,
        variants: [], // Add variants if you store them locally
        aiContent: localProduct.aiContent || '',
      };
    }
    // If not found locally, fetch from Shopify
    const client = await this.initialize();
    const query = `
      query getProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          handle
          title
          description
          tags
          images(first: 5) {
            edges {
              node {
                url
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                }
                availableForSale
              }
            }
          }
        }
      }
    `;
    const response = await client.request(query, { handle });
    const product = response.productByHandle;
    if (!product) return null;
    // Check for AI content in AiProductContent collection
    let aiContentDoc = await aiProductContent.findOne({ handle });
    let aiContent = aiContentDoc ? aiContentDoc.aiContent : '';
    // If not found, generate and store
    if (!aiContent && (!product.description || product.description.trim().length < 30)) {
      try {
        aiContent = await generateProductDetails(product.title, product.description || product.title);
        await aiProductContent.create({ handle, shopifyId: product.id, aiContent });
      } catch (err) {
        console.error('Gemini generation failed:', err.message);
        aiContent = '';
      }
    }
    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,
      tags: product.tags,
      images: product.images.edges.map(edge => edge.node.url),
      price: product.priceRange.minVariantPrice.amount,
      variants: product.variants.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        price: edge.node.price.amount,
        availableForSale: edge.node.availableForSale
      })),
      aiContent: aiContent,
    };
  }

  async fetchOrdersByEmail(email) {
    const shop = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
    const url = `https://${shop}.myshopify.com/admin/api/2023-10/orders.json?email=${encodeURIComponent(email)}&status=any`;
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching orders from Shopify:', error.response?.data || error.message);
      throw new Error('Failed to fetch orders from Shopify');
    }
  }

  async fetchOrderByNumber(orderNumber) {
    const shop = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
    const url = `https://${shop}.myshopify.com/admin/api/2023-10/orders.json?name=${encodeURIComponent(orderNumber)}&status=any`;
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      return response.data.orders && response.data.orders.length > 0 ? response.data.orders[0] : null;
    } catch (error) {
      console.error('Error fetching order by number from Shopify:', error.response?.data || error.message);
      throw new Error('Failed to fetch order from Shopify');
    }
  }

  async fetchRelatedProducts(currentHandle, limit = 4) {
    try {
      const client = await this.initialize();
      
      // First, get the current product to extract tags
      const currentProduct = await this.fetchProductByHandle(currentHandle);
      if (!currentProduct || !currentProduct.tags || currentProduct.tags.length === 0) {
        // If no tags, fetch some recent products
        const recentProducts = await this.fetchProducts({ limit: limit + 1 });
        return recentProducts.filter(product => product.handle !== currentHandle).slice(0, limit);
      }

      // Use the first few tags to find related products
      const searchTags = currentProduct.tags.slice(0, 2).join(' ');
      const query = `
        query($first: Int!, $query: String!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                handle
                title
                description
                priceRange { 
                  minVariantPrice { 
                    amount 
                  } 
                }
                images(first: 1) { 
                  edges { 
                    node { 
                      url 
                    } 
                  } 
                }
                tags
                variants(first: 1) { 
                  edges { 
                    node { 
                      id 
                      price { 
                        amount 
                      } 
                      availableForSale
                    } 
                  } 
                }
              }
            }
          }
        }
      `;

      const variables = {
        first: limit + 1, // Get one extra to account for the current product
        query: `tag:${searchTags}`
      };

      const response = await client.request(query, variables);
      
      if (!response.products || !response.products.edges) {
        return [];
      }

      // Filter out the current product and map the results
      const products = response.products.edges
        .map(edge => ({
          id: edge.node.id,
          handle: edge.node.handle,
          title: edge.node.title,
          description: edge.node.description,
          price: edge.node.priceRange.minVariantPrice.amount,
          images: edge.node.images.edges.map(img => img.node.url),
          tags: edge.node.tags,
          variantId: edge.node.variants.edges[0]?.node.id,
          variantPrice: edge.node.variants.edges[0]?.node.price.amount,
          availableForSale: edge.node.variants.edges[0]?.node.availableForSale
        }))
        .filter(product => product.handle !== currentHandle)
        .slice(0, limit);

      return products;
    } catch (error) {
      console.error('Error fetching related products:', error);
      // Fallback to recent products if related products fetch fails
      try {
        const fallbackProducts = await this.fetchProducts({ limit });
        return fallbackProducts.filter(product => product.handle !== currentHandle);
      } catch (fallbackError) {
        console.error('Error fetching fallback products:', fallbackError);
        return [];
      }
    }
  }

  // Create a paid order in Shopify via Admin API (for Razorpay/INR payments)
  async createPaidOrder({ lineItems, customer, shippingAddress, paymentDetails, note }) {
    const shop = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
    const url = `https://${shop}.myshopify.com/admin/api/2023-10/orders.json`;
    const orderData = {
      order: {
        line_items: lineItems,
        customer,
        shipping_address: shippingAddress,
        financial_status: 'paid',
        transactions: [
          {
            kind: 'sale',
            status: 'success',
            amount: paymentDetails.amount_usd,
            gateway: 'manual',
          }
        ],
        note: note || 'Paid via Razorpay',
        currency: 'USD',
      }
    };
    
    console.log('--- [Shopify] Sending Order Data ---');
    console.log('URL:', url);
    console.log('Order Data:', JSON.stringify(orderData, null, 2));
    
    try {
      const response = await axios.post(url, orderData, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      console.log('--- [Shopify] Order Created Successfully ---');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data.order;
    } catch (error) {
      console.error('--- [Shopify] Order Creation Failed ---');
      console.error('Error Response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error Status:', error.response?.status);
      console.error('Error Headers:', error.response?.headers);
      console.error('Full Error:', error.message);
      throw new Error('Failed to create paid order in Shopify');
    }
  }

  async findCustomerByEmailOrPhone({ email, phone }) {
    const shop = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
    let url = `https://${shop}.myshopify.com/admin/api/2023-10/customers/search.json?limit=1`;
    if (email) {
      url += `&query=email:${encodeURIComponent(email)}`;
    } else if (phone) {
      url += `&query=phone:${encodeURIComponent(phone)}`;
    } else {
      return null;
    }
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.customers && response.data.customers.length > 0) {
        return response.data.customers[0];
      }
      return null;
    } catch (error) {
      console.error('Error searching Shopify customer:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = new ShopifyService(); 