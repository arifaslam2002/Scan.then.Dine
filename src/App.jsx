import { BrowserRouter, Routes, Route } from "react-router-dom";
import socket from "./services/socket";
import Welcome from "./pages/customer/Welcome";
import AllergySelection from "./pages/customer/AllergySelection";
import Menu from "./pages/customer/Menu";
import FoodDetails from "./pages/customer/FoodDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import KitchenDashboard from "./pages/kitchen/KitchenDashboard";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import OrderTracking from "./pages/customer/OrderTracking";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddFood from "./pages/admin/AddFood";
import EditFood from "./pages/admin/EditFood";
import Tables from "./pages/admin/Tables";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/allergies" element={<AllergySelection />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/order/:id" element={<OrderTracking />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute allowedRoles={["admin", "kitchen"]} />}>
          <Route path="/kitchen" element={<KitchenDashboard />} />
        </Route>
        {/* Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/foods/new" element={<AddFood />} />
          <Route path="/admin/foods/edit/:id" element={<EditFood />} />
          <Route path="/admin/tables" element={<Tables />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
