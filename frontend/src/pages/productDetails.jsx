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
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 cursor-pointer hover:text-slate-800" onClick={() => navigate('/')}>Home</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium">Product details</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-slate-800 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-500">Next Product</span>
              <button className="text-gray-500 hover:text-slate-800 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Product Details</h1>
              
              <div className="bg-gray-50 rounded-xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Section - Product Info */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {product.description}
                    </p>

                    {/* Thumbnail Images */}
                    {product.images && product.images.length > 1 && (
                      <div className="flex gap-3">
                        {product.images.slice(0, 3).map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                              selectedImage === idx ? 'border-slate-800 scale-105' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={`${backendURL}${img}`}
                              alt={`${product.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Center Section - Product Image */}
                  <div className="flex justify-center items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gray-200 rounded-full blur-3xl opacity-30"></div>
                      <div className="relative w-96 h-96 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`${backendURL}${product.images[selectedImage]}`}
                            alt={product.name}
                            className="w-80 h-80 object-contain"
                          />
                        ) : (
                          <div className="text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-lg shadow-md border border-gray-100">
                        <p className="text-3xl font-bold text-slate-800">${product.price}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Options */}
                  <div className="lg:col-start-2 space-y-6">
                    {/* Review */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Review:</p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">4.5 (60)</span>
                      </div>
                    </div>

                    {/* Color Options */}
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Color:</p>
                      <div className="flex gap-3">
                        <button className="w-10 h-10 rounded-full bg-slate-600 border-2 border-white shadow-md hover:scale-110 transition-transform"></button>
                        <button className="w-10 h-10 rounded-full bg-gray-800 border-2 border-white shadow-md hover:scale-110 transition-transform"></button>
                        <button className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white shadow-md hover:scale-110 transition-transform"></button>
                        <button className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white shadow-md hover:scale-110 transition-transform"></button>
                      </div>
                    </div>

                    {/* Size Options */}
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Size:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['37', '38', '39', '40', '41', '42'].map((size) => (
                          <button
                            key={size}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              size === '38'
                                ? 'bg-slate-800 border-slate-800 text-white font-semibold'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-slate-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={addtocart}
                      className="w-full bg-slate-800 text-white py-4 rounded-lg font-semibold hover:bg-slate-700 transition-all transform hover:scale-[1.02] shadow-md"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Products Section */}
              <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Related Product</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Showing 1-12 of 36 results</span>
                    <select className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500">
                      <option>Default sorting</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}