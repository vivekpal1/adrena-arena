import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./components/WalletProvider";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Leagues } from "./pages/Leagues";
import { Agents } from "./pages/Agents";
import { Tournaments } from "./pages/Tournaments";
import { Profile } from "./pages/Profile";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leagues" element={<Leagues />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
