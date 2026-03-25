import React, { useEffect, useState } from "react";
import Product from "../components/auth/Product";
import NavBar from "../components/auth/nav";
import axios from "../axiosConfig";
import { useSelector } from "react-redux";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userWishlist, setUserWishlist] = useState([]);
  const email = useSelector((state) => state.user.email);

  useEffect(() => {
    axios.get("/api/v2/product/get-products")
      .then((res) => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (email) {
      axios.get(`/api/v2/product/wishlist?email=${email}`)
        .then(res => {
          if (res.data && res.data.wishlist) {
            setUserWishlist(res.data.wishlist.map(p => p._id));
          }
        })
        .catch(console.error);
    } else {
      setUserWishlist([]);
    }
  }, [email]);

  const toggleWishlistMatch = (productId) => {
    if (userWishlist.includes(productId)) {
      setUserWishlist(prev => prev.filter(id => id !== productId));
    } else {
      setUserWishlist(prev => [...prev, productId]);
    }
  };

  // Dot Pattern Style
  const patternStyle = {
    backgroundColor: "#ffffff",
    backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
    backgroundSize: '30px 30px',
    backgroundAttachment: 'fixed'
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Loading Nexis...</div>;

  return (
    <div className="min-h-screen w-full relative" style={patternStyle}>
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>

      <NavBar />

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Nexis <span className="text-indigo-600">Inventory</span>
            </h1>
            <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product._id} className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <Product
                    {...product}
                    userWishlist={userWishlist}
                    onToggleWishlist={() => toggleWishlistMatch(product._id)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400">Inventory is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}