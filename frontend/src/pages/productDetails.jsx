import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import NavBar from "../components/auth/nav";
import { Plus, Minus, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const email = useSelector((state) => state.user.email);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/v2/product/product/${id}`);
        setProduct(response.data.product); // Ensure correct state setting
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };
  const addtocart = async () => {
    if (!email) {
      alert("No user email found! Please login.");
      return;
    }
    try {
      const response = await axios.post("/api/v2/product/cart",
        {
          userId: email,
          productId: id,
          quantity: quantity,
        }
      );
      console.log("Added to cart:", response.data);
      alert("Item added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">
          Error: {error.message}
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-xl">No product found.</div>
      </div>
    );
  }
  const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div className="min-h-screen w-full relative" style={{
      backgroundColor: "#f8fafc",
      backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
      backgroundSize: '30px 30px',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
      <NavBar />

      <main className="relative z-10 pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigate('/')}>Home</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigate('/my-products')}>Products</span>
              <span className="text-gray-400">/</span>
              <span className="text-indigo-600 font-medium truncate max-w-[200px]">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-indigo-50/50 to-transparent pointer-events-none"></div>

            <div className="p-6 lg:p-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                {/* Left Section - Images */}
                <div className="flex flex-col-reverse lg:flex-row gap-6">
                  {/* Thumbnails */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar shrink-0">
                      {product.images.slice(0, 4).map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all p-1 bg-white shadow-sm shrink-0 ${selectedImage === idx ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent hover:border-indigo-200'
                            }`}
                        >
                          <img
                            src={`${backendURL}${img}`}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-contain rounded-xl bg-gray-50"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Image */}
                  <div className="flex-grow flex justify-center items-center bg-gray-50/50 rounded-3xl border border-gray-100/60 p-8 min-h-[400px] relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 transition-opacity opacity-0 group-hover:opacity-100"></div>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`${backendURL}${product.images[selectedImage]}`}
                        alt={product.name}
                        className="w-full h-full object-contain max-h-[500px] transition-transform duration-700 group-hover:scale-105 relative z-10 drop-shadow-xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>No image available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Info & Actions */}
                <div className="flex flex-col justify-center space-y-8">
                  <div className="space-y-4">
                    <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-widest mb-2">
                      {product.category || "General"}
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                      {product.name}
                    </h1>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors">(128 Reviews)</span>
                    </div>

                    <div className="flex items-end gap-3 pt-2">
                      <span className="text-5xl font-black text-indigo-600">${Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed border-y border-gray-100 py-6">
                    {product.description}
                  </p>

                  <div className="space-y-6 pt-2">
                    {/* Quantity Selector */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Quantity</h3>
                      <div className="flex items-center w-max bg-gray-50 rounded-xl p-1.5 border border-gray-200/60 shadow-inner">
                        <button
                          onClick={handleDecrement}
                          className="w-12 h-12 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
                        >
                          <Minus size={20} />
                        </button>
                        <span className="w-16 text-xl text-center font-bold text-gray-900 select-none">
                          {quantity}
                        </span>
                        <button
                          onClick={handleIncrement}
                          className="w-12 h-12 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={addtocart}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </button>
                    <button className="flex-none w-16 h-16 sm:w-auto sm:h-auto sm:px-8 bg-white border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all shadow-sm">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">Free Shipping</p>
                        <p className="text-gray-500">On orders over $50</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">Free Returns</p>
                        <p className="text-gray-500">Within 30 days</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}