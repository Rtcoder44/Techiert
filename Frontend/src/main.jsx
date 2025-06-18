import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from 'react-redux';
import store from './redux/store';
import { CurrencyProvider } from './context/currencyContext';

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <Provider store={store}>
      <AuthProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </AuthProvider>
    </Provider>
  </HelmetProvider>
);
