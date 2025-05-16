import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";

import { HelmetProvider } from "react-helmet-async";  // <-- import HelmetProvider

createRoot(document.getElementById("root")).render(
  <HelmetProvider>             {/* Wrap your app with HelmetProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </HelmetProvider>
);
