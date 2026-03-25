import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage, SignupPage, Home, CreateProduct, MyProducts, Cart, ProductDetails, Profile, CreateAddress, SelectAddress, OrderConfirmation, OrderSuccess, MyOrdersPage, AdminDashboard, FeedbackDashboard, Wishlist } from "./Routes";
import ChatbotStreaming from './features/ai/components/ChatbotStreaming';
import { useDispatch } from 'react-redux';
import { setUser } from './store/userActions';
import axios from './axiosConfig';
import "./App.css";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore user session from cookie on app load
    const loadUser = async () => {
      try {
        const response = await axios.get('/api/v2/user/getuser', { withCredentials: true });
        if (response.data.success) {
          dispatch(setUser({
            email: response.data.user.email,
            role: response.data.user.role,
            name: response.data.user.name,
          }));
        }
      } catch (error) {
        // User not logged in or token expired
        localStorage.removeItem('shophub_user');
        dispatch({ type: 'LOGOUT' });
      }
    };
    loadUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/feedback" element={<FeedbackDashboard />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/create-product/:id" element={<CreateProduct />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path='/create-address' element={<CreateAddress />} />
        <Route path="/select-address" element={<SelectAddress />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/myorders" element={<MyOrdersPage />} />
      </Routes>
      <ChatbotStreaming />
    </BrowserRouter>
  )
}

export default App