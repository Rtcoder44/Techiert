import React, { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext();

const BASE_CURRENCY = 'USD';
const DEFAULT_CURRENCY = {
  code: 'USD',
  symbol: '$',
  country: 'US',
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

        const code = (geo.currency || 'USD').toUpperCase().trim();
        const country = geo.country || 'US';

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

        if (!data.rates.INR) {
          data.rates.INR = 83.5;
        }

        setRates(data.rates);
      } catch (e) {
        setRates({ USD: 1, INR: 83.5 }); // fallback
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
