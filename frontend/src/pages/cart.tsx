import React, { useState, useEffect } from 'react';
import CartProduct from '../components/auth/CartProduct';
import NavBar from '../components/auth/nav';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../axiosConfig';

// --- Type Definitions ---

interface RootState {
  user: {
    email: string | null;
  };
}

interface Product {
  _id: string;
  quantity: number;
  [key: string]: any; 
}

const Cart: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Get the email from Redux state
  const email = useSelector((state: RootState) => state.user.email);

  useEffect(() => {
    if (!email) return;

    axios.get(`/api/v2/product/cartproducts?email=${email}`)
      .then((res) => {
        setProducts(
          res.data.cart.map((product: any) => ({
            quantity: product.quantity,
            ...product.productId,
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch cart products", err);
      });
  }, [email]);

  const handlePlaceOrder = (): void => {
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
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Items</p>
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