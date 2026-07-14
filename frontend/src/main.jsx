import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./style.css";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PlantDiscovery from "./pages/PlantDiscovery";
import NewReflection from "./pages/NewReflection";
import Reflections from "./pages/Reflections";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect URL  */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public routes*/}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private routes: login required */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/plants" element={<PlantDiscovery />} />
              <Route path="/new-reflection" element={<NewReflection />} />
              <Route path="/reflections" element={<Reflections />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
