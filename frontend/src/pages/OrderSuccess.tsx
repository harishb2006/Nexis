import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/auth/nav';

const OrderSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState<number>(5);

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/myorders');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen w-full relative flex flex-col" style={{
            backgroundColor: "#f8fafc",
            backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundAttachment: 'fixed'
        }}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            
            <NavBar />
            
            <main className="relative z-10 flex-grow flex justify-center items-center p-4 pt-24">
                <div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8 lg:p-12 text-center">
                    
                    {/* Text-based Success Badge */}
                    <div className="mb-6">
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 font-black tracking-widest uppercase text-xs rounded-lg border border-emerald-100">
                            Success
                        </span>
                    </div>

                    {/* Success Message */}
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Order Placed!</h2>
                    <p className="text-gray-500 font-medium text-sm mb-8">
                        Thank you for your purchase. Your order has been successfully logged and is currently processing.
                    </p>

                    {/* Order Details */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/60 mb-8 space-y-2">
                        <p className="text-sm text-gray-600 font-medium">
                            An email confirmation will be sent shortly with your receipt and order details.
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                            Track your order status via the My Orders dashboard.
                        </p>
                    </div>

                    {/* Countdown Timer */}
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 animate-pulse">
                        Redirecting to Orders in <span className="text-indigo-600">{countdown}</span> seconds...
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/myorders')}
                            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white text-gray-900 border border-gray-200 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderSuccess;