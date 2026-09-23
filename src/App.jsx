import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ParcelQR from "./pages/ParcelQR";
import GuestCount from "./pages/customer/GuestCount";
import ActiveOrder from "./pages/customer/ActiveOrder";
import FinishDining from "./pages/customer/FinishDining";
import FinalBill from "./pages/customer/FinalBill";
import CounterDashboard from "./pages/counter/CounterDashboard";
import KitchenLogin from "./pages/kitchen/KitchenLogin";
import CounterLogin from "./pages/counter/CounterLogin";
import ReviewOrder from "./pages/customer/ReviewOrder";
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
        <Route path="/parcel" element={<Welcome />} />
        <Route path="/guest-count" element={<GuestCount />} />
        <Route path="/active-order" element={<ActiveOrder />} />
        <Route path="/finish-dining" element={<FinishDining />} />
        <Route path="/bill" element={<FinalBill />} />
        <Route path="/counter" element={<CounterDashboard />} />
        <Route path="/kitchen/login" element={<KitchenLogin />} />
        <Route path="/review-order" element={<ReviewOrder />} />

        <Route path="/counter/login" element={<CounterLogin />} />
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
          <Route path="/admin/parcel-qr" element={<ParcelQR />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["counter"]} />}>
          <Route path="/counter" element={<CounterDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
