import React, { useEffect, useState } from "react";
import Product from "../components/auth/Product";
import NavBar from "../components/auth/nav";
import axios from "../axiosConfig";

export default function Home() {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  axios.get("/api/v2/product/get-products")
    .then((res) => {
      setProducts(res.data.products || []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      setError(err.message);
      setLoading(false);
    });
}, []);

if (loading) {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 text-lg">Loading products...</p>
        </div>
      </div>
    </>
  );
}

if (error) {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    </>
  );
}

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Discover Our Collection</h1>
            <p className="text-gray-600 text-lg">Explore the finest products curated just for you</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Product key={product._id} {...product} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-600 text-xl">No products available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}