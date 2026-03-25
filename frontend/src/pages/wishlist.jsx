import React, { useEffect, useState } from "react";
import NavBar from "../components/auth/nav";
import Product from "../components/auth/Product";
import axios from "../axiosConfig";
import { useSelector } from "react-redux";
import { Heart } from "lucide-react";

export default function Wishlist() {
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const email = useSelector((state) => state.user.email);

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }

        axios.get(`/api/v2/product/wishlist?email=${email}`)
            .then((res) => {
                setWishlistProducts(res.data.wishlist || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [email]);

    const toggleWishlistMatch = (productId) => {
        // Optimistic removal from UI
        setWishlistProducts(prev => prev.filter(p => p._id !== productId));
    };

    // Dot Pattern Style
    const patternStyle = {
        backgroundColor: "#f8fafc",
        backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
        backgroundSize: '30px 30px',
        backgroundAttachment: 'fixed'
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl font-bold text-indigo-600 animate-pulse">Loading Wishlist...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative" style={patternStyle}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            <NavBar />

            <main className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight flex items-center justify-center gap-3">
                        <Heart className="text-rose-500 fill-rose-500" size={32} /> My <span className="text-indigo-600">Wishlist</span>
                    </h1>
                    <p className="text-gray-500">Products you've liked</p>
                </div>

                {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {wishlistProducts.map((product) => (
                            <div key={product._id} className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                <Product
                                    {...product}
                                    userWishlist={wishlistProducts.map(p => p._id)}
                                    onToggleWishlist={() => toggleWishlistMatch(product._id)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm text-center px-4">
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <Heart size={40} className="text-rose-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 max-w-md mb-8">Save items you like in your wishlist to easily order them later.</p>
                        <a
                            href="/"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 transform hover:-translate-y-0.5"
                        >
                            Explore Products
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}
