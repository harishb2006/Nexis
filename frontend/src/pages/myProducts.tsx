import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Myproduct from "../components/auth/myproduct";
import NavBar from "../components/auth/nav";
import { useSelector } from "react-redux";
import axios from "../axiosConfig";

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

const MyProducts: React.FC = () => {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const email = useSelector((state: RootState) => state.user.email);

    useEffect(() => {
        if (!email) return;
        
        setLoading(true);
        axios.get(`/api/v2/product/my-products?email=${email}`)
            .then((res) => {
                setProducts(res.data.products);
                setLoading(false);
            })
            .catch((err: any) => {
                setError(err.message || "Failed to load products");
                setLoading(false);
            });
    }, [email]);

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
                    <p className="text-gray-900 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative font-sans antialiased" style={{
            backgroundColor: "#ffffff",
            backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundAttachment: 'fixed'
        }}>
            {/* Overlay to ensure readability */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            
            <NavBar />
            
            <main className="relative z-10 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section aligned with Theme */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 border-b border-gray-200/60 pb-6 gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">My <span className="text-indigo-600">Listings</span></h1>
                            <p className="text-gray-500 font-medium mt-2">
                                Managing {products.length} products in your shop
                            </p>
                        </div>
                        <Link 
                            to="/create-product" 
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-gray-900 px-8 py-3.5 rounded-xl text-white hover:bg-black transition-all shadow-sm font-bold text-sm uppercase tracking-wide border border-gray-800"
                        >
                            Add New Product
                        </Link>
                    </div>

                    {/* Status Handling */}
                    {error ? (
                        <div className="bg-rose-50/80 backdrop-blur-md border border-rose-100 p-6 rounded-[2rem] text-center">
                            <p className="text-rose-600 font-bold text-sm tracking-wide uppercase">Error: {error}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center py-24 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-200">
                            <div className="mb-4">
                                <span className="px-4 py-2 bg-gray-50 text-gray-400 font-black tracking-widest uppercase text-xs rounded-lg border border-gray-200">Empty Record</span>
                            </div>
                            <p className="text-gray-900 text-2xl font-black mb-2">No products listed yet.</p>
                            <Link to="/create-product" className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors inline-block mt-1 underline decoration-2 underline-offset-4">
                                Create your first listing
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white/80 backdrop-blur-md rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                                    <Myproduct {...product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyProducts;