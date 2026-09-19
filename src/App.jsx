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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/allergies" element={<AllergySelection />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/order/:id" element={<OrderTracking />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
