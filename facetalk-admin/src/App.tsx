import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Bookings from "./pages/Bookings";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Messages from "./pages/Messages";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Everything inside needs an admin login */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/messages" element={<Messages />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}