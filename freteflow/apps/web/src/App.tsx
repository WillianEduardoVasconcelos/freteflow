import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Clients from "./pages/Clients";
import Freights from "./pages/Freights";
import { useAuthStore } from "./store/auth.store";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fretes" element={<Freights />} />
        <Route path="veiculos" element={<Vehicles />} />
        <Route path="motoristas" element={<Drivers />} />
        <Route path="clientes" element={<Clients />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
