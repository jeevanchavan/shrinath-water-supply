import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "13.5px", fontWeight: 500, borderRadius: "10px" },
          success: { iconTheme: { primary: "#059669", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#DC2626", secondary: "#fff" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
