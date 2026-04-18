import React, { useState, useEffect } from 'react';
import CartProduct from '../components/auth/CartProduct';
import NavBar from '../components/auth/nav';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../axiosConfig';

const Cart = () => {

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Get the email from Redux state
  const email = useSelector((state: any) => state.user.email);
  useEffect(() => {
    if (!email) return;

    axios.get(`/api/v2/product/cartproducts?email=${email}`)
      // fetch(`http://localhost:8000/api/v2/product/cartproducts?email=${'sibishree.m@kalvium.community'}`)
      // .then((res) => {
      //   if (!res.ok) {
      //     throw new Error(`HTTP error! status: ${res.status}`);
      //   }
      //   return res.json();
      // })
      .then((res) => {
        setProducts(res.data.cart.map(product => ({ quantity: product.quantity, ...product.productId, })));
      })
      .catch((err) => {
      });
  }, [email]);

  const handlePlaceOrder = () => {
    navigate('/select-address');
  };

  return (
    <div className="min-h-screen w-full relative" style={{
      backgroundColor: "#f8fafc",
      backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
      backgroundSize: '30px 30px',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
      <NavBar />

      <main className="relative z-10 pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-gray-200/60 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Shopping <span className="text-indigo-600">Cart</span></h1>
            <p className="text-gray-500 mt-2">Review your items and proceed to checkout</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm text-center px-4">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 max-w-md mb-8">Looks like you haven't added anything to your cart yet.</p>
            <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md transform hover:-translate-y-0.5">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <div className="flex flex-col gap-4 mb-8">
              {products.map(product => (
                <CartProduct key={product._id} {...product} />
              ))}
            </div>

            <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left w-full sm:w-auto">
                <p className="text-gray-500 text-sm font-mediumuppercase tracking-wide">Total Items</p>
                <p className="text-2xl font-black text-gray-900">{products.length}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;