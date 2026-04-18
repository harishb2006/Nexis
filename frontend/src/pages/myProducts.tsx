import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Myproduct from "../components/auth/myproduct";
import NavBar from "../components/auth/nav";
import { useSelector } from "react-redux";
import axios from "../axiosConfig";

export default function MyProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const email = useSelector((state: any) => state.user.email);

    useEffect(() => {
        if (!email) return;
        setLoading(true);
        axios.get(`/api/v2/product/my-products?email=${email}`)
            .then((res) => {
                setProducts(res.data.products);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [email]);

    // Dot Pattern Style matching Home.jsx
    const patternStyle = {
        backgroundColor: "#ffffff",
        backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
        backgroundSize: '25px 25px',
        backgroundAttachment: 'fixed'
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600 bg-white">Loading Inventory...</div>;

    return (
        <div className="min-h-screen w-full relative font-sans antialiased" style={patternStyle}>
            {/* Overlay to ensure readability */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            
            <NavBar />
            
            <main className="relative z-10 pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section aligned with Theme */}
                    <div className="text-center mb-12">
                       
                   
                        <p className="text-gray-500 font-medium">
                            Managing {products.length} products in your shop
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end mb-8">
                        <Link 
                            to="/create-product" 
                            className="inline-flex items-center justify-center bg-indigo-600 px-6 py-3 rounded-xl text-white hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 font-semibold"
                        >
                            <span className="text-xl mr-2">+</span> Add Product
                        </Link>
                    </div>

                    {/* Status Handling */}
                    {error ? (
                        <div className="bg-red-50/80 backdrop-blur-md border border-red-100 p-6 rounded-2xl text-center">
                            <p className="text-red-600 font-medium">Oops! {error}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                            <p className="text-gray-400 text-xl font-medium">No products listed yet.</p>
                            <Link to="/create-product" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">Create your first listing</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                                    <Myproduct {...product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}