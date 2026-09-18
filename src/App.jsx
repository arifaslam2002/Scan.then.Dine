import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/customer/Welcome";
import AllergySelection from "./pages/customer/AllergySelection";
import Menu from "./pages/customer/Menu";
import FoodDetails from "./pages/customer/FoodDetails";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/allergies" element={<AllergySelection />} />
        <Route path="/menu" element={<Menu />} />
          <Route
    path="/food/:id"
    element={<FoodDetails />}
  />
      </Routes>
    </BrowserRouter>
  );
};

export default App;