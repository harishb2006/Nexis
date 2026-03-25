import { useEffect, useState } from "react";
import Myproduct from "../components/auth/myproduct";
import NavBar from "../components/auth/nav";
import { useSelector } from "react-redux";
import axios from "../axiosConfig";

export default function MyProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Get the email from Redux state
    const state = useSelector((state) => state);
    const email = useSelector((state) => state.user.email);

    useEffect(() => {
        // Only fetch if email is available
        if (!email) return;
        axios.get(`/api/v2/product/my-products?email=${email}`)
            //  fetch(`http://localhost:8000/api/v2/product/my-products?email=${email}`)
            //  .then((res) => {
            //      if (!res.ok) {
            //          throw new Error(`HTTP error! status: ${res.status}`);
            //      }
            //      return res.json();
            //  })
            .then((res) => {
                setProducts(res.data.products);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [email]);

    // Dot Pattern Style (similar to Home)
    const patternStyle = {
        backgroundColor: "#f8fafc",
        backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
        backgroundSize: '30px 30px',
        backgroundAttachment: 'fixed'
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl font-bold text-indigo-600 animate-pulse">Loading collection...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-sm border border-red-100">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative" style={patternStyle}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            <NavBar />

            <main className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-12 border-b border-gray-200/60 pb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            My <span className="text-indigo-600">Products</span>
                        </h1>
                        <p className="text-gray-500 mt-2">Manage your inventory and listings</p>
                    </div>
                    <a
                        href="/create-product"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <span className="text-xl leading-none">+</span> Add New Product
                    </a>
                </div>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm text-center px-4">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                        <p className="text-gray-500 max-w-md mb-8">You haven't added any products to your inventory yet. Start selling by creating your first listing!</p>
                        <a
                            href="/create-product"
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 px-8 py-3 rounded-xl font-bold transition-colors border border-indigo-100"
                        >
                            Create First Product
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <Myproduct key={product._id} {...product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}