import React, { useEffect, useState } from "react";
import NavBar from "../components/auth/nav";
import Product from "../components/auth/Product";
import axios from "../axiosConfig";
import { useSelector } from "react-redux";

// --- Type Definitions ---

interface RootState {
    user: {
        email: string | null;
    };
}

interface ProductData {
    _id: string;
    [key: string]: any; 
}

const Wishlist: React.FC = () => {
    const [wishlistProducts, setWishlistProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const email = useSelector((state: RootState) => state.user.email);

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
            .catch((err: any) => {
                console.error("Failed to fetch wishlist", err);
                setLoading(false);
            });
    }, [email]);

    const toggleWishlistMatch = (productId: string): void => {
        // Optimistic removal from UI
        setWishlistProducts(prev => prev.filter(p => p._id !== productId));
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full relative" style={{
                backgroundColor: "#f8fafc",
                backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
                backgroundSize: '30px 30px',
                backgroundAttachment: 'fixed'
            }}>
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <p className="text-gray-900 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative" style={{
            backgroundColor: "#f8fafc",
            backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundAttachment: 'fixed'
        }}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            <NavBar />

            <main className="relative z-10 pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 border-b border-gray-200/60 pb-6">
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                        My <span className="text-indigo-600">Wishlist</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Products you've liked</p>
                </div>

                {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {wishlistProducts.map((product) => (
                            <div key={product._id} className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <Product
                                    {...product}
                                    userWishlist={wishlistProducts.map(p => p._id)}
                                    onToggleWishlist={() => toggleWishlistMatch(product._id)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm text-center px-4">
                        <div className="mb-6">
                            <span className="px-4 py-2 bg-gray-50 text-gray-400 font-black tracking-widest uppercase text-[10px] rounded-lg border border-gray-200">Empty Record</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 max-w-md mb-8 text-sm font-medium">Save items you like in your wishlist to easily order them later.</p>
                        <a
                            href="/"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-md shadow-indigo-200 transform hover:-translate-y-0.5"
                        >
                            Explore Products
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Wishlist;