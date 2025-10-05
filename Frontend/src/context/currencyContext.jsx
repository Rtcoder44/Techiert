import React, { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext();

// Store prices are saved in INR. Convert from INR -> user's currency.
const BASE_CURRENCY = 'INR';
const DEFAULT_CURRENCY = {
  code: 'INR',
  symbol: '₹',
  country: 'IN',
};

const currencySymbols = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  // Add more as needed
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  // Detect user country/currency
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        const geo = await geoRes.json();

        const code = (geo.currency || 'INR').toUpperCase().trim();
        const country = geo.country || 'IN';

        setCurrency({
          code,
          symbol: currencySymbols[code] || code,
          country,
        });
      } catch (e) {
        setCurrency(DEFAULT_CURRENCY);
      }
    };

    fetchCurrency();
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=${BASE_CURRENCY}`);
        const data = await res.json();

        if (!data || !data.rates || typeof data.rates !== 'object') {
          throw new Error('Invalid rates data');
        }

        // Ensure INR base present when third-party fails
        if (!data.rates || !data.rates.USD) data.rates.USD = 0.012; // fallback approx

        setRates(data.rates);
      } catch (e) {
        setRates({ INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 }); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Convert price utility
  const convertPrice = (amount) => {
    if (loading || amount == null || isNaN(amount)) return 0;
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const rate = rates[currency.code];

    if (!rate) {
      return numAmount;
    }

    return numAmount * rate;
  };

  // Format price utility
  const formatPrice = (amount) => {
    if (loading || amount == null || isNaN(amount)) return '...';
    const converted = convertPrice(amount);
    return `${currency.symbol} ${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, rates, convertPrice, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
