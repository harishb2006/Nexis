import React, { useState, useEffect } from 'react';
import NavBar from '../components/auth/nav';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from '../axiosConfig';

// --- Type Definitions ---

interface LocationState {
    addressId?: string;
    email?: string;
}

interface ShippingAddress {
    _id: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    addressType?: string;
}

interface CartItem {
    product: string;
    name: string;
    price: number;
    image: string[];
    quantity: number;
}

const OrderConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { addressId, email } = (location.state as LocationState) || {};
    
    const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'paypal'>('cod');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if (!addressId || !email) {
            navigate('/select-address');
            return;
        }

        const fetchData = async () => {
            try {
                const addressResponse = await axios.get('/api/v2/user/addresses', {
                    params: { email },
                });
                
                const address = addressResponse.data.addresses.find((a: ShippingAddress) => a._id === addressId);
                if (!address) throw new Error('Selected address not found.');
                setSelectedAddress(address);

                const cartResponse = await axios.get('/api/v2/product/cartproducts', {
                    params: { email },
                });
                const cartData = cartResponse.data;
                const backendURL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
                
                const processedCartItems: CartItem[] = cartData.cart.map((item: any) => ({
                    product: item.productId._id,
                    name: item.productId.name,
                    price: item.productId.price,
                    image: item.productId.images?.map(
                        (imagePath: string) => `${backendURL}/${imagePath}`
                    ) || [],
                    quantity: item.quantity,
                }));
                
                setCartItems(processedCartItems);
                
                const total = processedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                setTotalPrice(total);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [addressId, email, navigate]);

    const handlePlaceOrder = async (paymentType: 'cod' | 'paypal' = 'cod', paypalOrderData: any = null) => {
        setIsProcessing(true);
        try {
            const orderItems = cartItems.map(item => ({
                product: item.product,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image && item.image.length > 0 ? item.image[0] : '/default-avatar.png'
            }));

            const payload = {
                email,
                shippingAddress: selectedAddress,
                orderItems,
                paymentMethod: paymentType,
                paypalOrderData,
            };

            await axios.post('/api/v2/orders/place-order', payload);
            navigate('/order-success');
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        }
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
                    <p className="text-gray-900 font-bold tracking-widest uppercase text-sm animate-pulse">Processing Order Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full relative" style={{
                backgroundColor: "#f8fafc",
                backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
                backgroundSize: '30px 30px',
                backgroundAttachment: 'fixed'
            }}>
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-100 shadow-sm text-center max-w-md">
                        <span className="px-3 py-1.5 bg-rose-50 text-rose-600 font-black tracking-widest uppercase text-[10px] rounded-md border border-rose-100 mb-4 inline-block">Error</span>
                        <p className="text-gray-900 font-bold mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
                        >
                            Retry Checkout
                        </button>
                    </div>
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
            
            <main className="relative z-10 pt-32 pb-20 px-4 flex justify-center items-start">
                <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-6 lg:p-10">
                    <div className="mb-8 border-b border-gray-100 pb-6 text-center sm:text-left">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order <span className="text-indigo-600">Confirmation</span></h1>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Review your details and select a payment method</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column: Address & Items */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Shipping Destination</h3>
                                {selectedAddress ? (
                                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                        <p className="font-bold text-gray-900 text-sm mb-1">
                                            {selectedAddress.address1}{selectedAddress.address2 ? `, ${selectedAddress.address2}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-600 mb-1">{selectedAddress.city}{selectedAddress.state ? `, ${selectedAddress.state}` : ''}, {selectedAddress.zipCode}</p>
                                        <p className="text-xs text-gray-500 mb-3">{selectedAddress.country}</p>
                                        <span className="inline-block px-2.5 py-1 bg-white text-gray-600 text-[10px] font-bold tracking-widest rounded uppercase border border-gray-200">
                                            {selectedAddress.addressType || 'N/A'}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-rose-500 font-bold">No address selected.</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Cart Summary</h3>
                                {cartItems.length > 0 ? (
                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div key={item.product} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                        <img
                                                            src={item.image.length > 0 ? item.image[0] : '/default-avatar.png'}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm truncate max-w-[150px] sm:max-w-[200px]">{item.name}</p>
                                                        <p className="text-[11px] text-gray-500 font-medium">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-gray-900 text-sm">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 font-medium">Your cart is empty.</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Payment & Total */}
                        <div>
                            <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 sticky top-32">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Payment Details</h3>
                                
                                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Total Amount</span>
                                    <span className="text-3xl font-black text-indigo-600">₹{totalPrice.toFixed(2)}</span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                                {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                                            </div>
                                            <span className="font-bold text-sm text-gray-900">Cash on Delivery</span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                                {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                                            </div>
                                            <span className="font-bold text-sm text-gray-900">Pay Online (PayPal)</span>
                                        </div>
                                    </label>
                                </div>

                                {paymentMethod === 'paypal' ? (
                                    <div className="mt-4 z-0 relative">
                                        <PayPalScriptProvider
                                            options={{
                                                'client-id': (import.meta as any).env.VITE_CLIENT_ID || "test",
                                                currency: 'USD',
                                            }}
                                        >
                                            <PayPalButtons
                                                style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
                                                disabled={isProcessing}
                                                createOrder={(data, actions) => {
                                                    const conversionRate = 83; // 1 USD = 83 INR
                                                    const convertedPrice = (totalPrice / conversionRate).toFixed(2);
                                                    return actions.order.create({
                                                        purchase_units: [
                                                            {
                                                                amount: {
                                                                    value: convertedPrice,
                                                                },
                                                            },
                                                        ],
                                                    });
                                                }}
                                                onApprove={async (data, actions) => {
                                                    if (!actions.order) return;
                                                    const order = await actions.order.capture();
                                                    handlePlaceOrder('paypal', order);
                                                }}
                                                onError={(err) => {
                                                    console.error("PayPal Error:", err);
                                                    setError("There was an issue processing your PayPal payment.");
                                                }}
                                            />
                                        </PayPalScriptProvider>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handlePlaceOrder('cod', null)}
                                        disabled={isProcessing}
                                        className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                    >
                                        {isProcessing ? 'Processing...' : 'Confirm & Place Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderConfirmation;