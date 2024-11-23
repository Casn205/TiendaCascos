import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Product from "./pages/Product";
import Footer from "./components/Footer";
import bannermens from "./assets/bannermens.png"
import bannerwomens from "./assets/bannerwomens.png"
import bannerkids from "./assets/bannerkids.png"
import Hotjar from '@hotjar/browser';
import Payment from "./components/Payment";

const siteId = 5177497;
const hotjarVersion = 6;



export default function App() {
  return (
    Hotjar.init(siteId, hotjarVersion),
    <main className="bg-primary text-tertiary">
      
      <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/mens" element={<Category category="men" banner={bannermens}/>} />
        <Route path="/womens" element={<Category category="women" banner={bannerwomens}/>}/>
        <Route path="/kids" element={<Category category="kid" banner={bannerkids}/>}/>
        <Route path="/product" element={<Product/>}/>
           <Route path="/product/:productId" element={<Product />}>
        </Route>
        <Route path="/cart-page" element={<Cart/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/payment" element={<Payment/>}/>
      </Routes>
      <Footer />
      </BrowserRouter>
      
    </main>
  )
}
