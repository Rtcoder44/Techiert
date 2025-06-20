const { Shopify } = require('@shopify/shopify-api');
const axios = require('axios');

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
        image: edge.node.images.edges[0]?.node.url,
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
      }))
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
}

module.exports = new ShopifyService(); 