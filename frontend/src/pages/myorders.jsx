import { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import NavBar from '../components/auth/nav';
import { useSelector } from 'react-redux';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const email = useSelector((state) => state.user.email);

    const fetchOrders = async () => {
        if (!email) return;
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/v2/orders/myorders', {
                params: { email: email },
            });
            setOrders(response.data.orders);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    // Cancel order handler
    const cancelOrder = async (orderId) => {
        try {
            const response = await axios.patch(`/api/v2/orders/cancel-order/${orderId}`);
            // Update the order in local state: either remove or update its status.
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: response.data.order.status } : order
                )
            );
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling order');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [email]);

    return (
        <div className="min-h-screen w-full relative" style={{
            backgroundColor: "#f8fafc",
            backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundAttachment: 'fixed'
        }}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            <NavBar />
            <main className="relative z-10 pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-gray-200/60 pb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My <span className="text-indigo-600">Orders</span></h1>
                        <p className="text-gray-500 mt-2">Track and manage your recent purchases</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-xl font-bold text-indigo-600 animate-pulse">Loading orders...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-sm border border-red-100 text-center">{error}</div>
                ) : orders.length > 0 ? (
                    <div className="grid gap-8">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 p-6 sm:p-8 relative overflow-hidden group"
                            >
                                {/* Status indicator line */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${order.orderStatus === 'Cancelled' ? 'bg-red-500' : 'bg-green-500'}`}></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                                        <p className="font-mono text-gray-900 font-medium">{order._id}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                        <p className="text-2xl font-black text-indigo-600">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                    <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100/60">
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Shipping Address</h2>
                                        <div className="text-gray-600 text-sm space-y-1">
                                            <p className="font-medium text-gray-800">
                                                {order.shippingAddress.address1}
                                                {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                                            </p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                                            <p>{order.shippingAddress.country}</p>
                                            <span className="inline-block mt-2 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md uppercase">
                                                {order.shippingAddress.addressType}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100/60">
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Order Items</h2>
                                        <ul className="space-y-3">
                                            {order.orderItems.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-gray-800 font-medium truncate pr-4">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                                    <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    {order.orderStatus !== 'Cancelled' ? (
                                        <button
                                            onClick={() => cancelOrder(order._id)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-6 rounded-xl transition-colors border border-red-100 shadow-sm"
                                        >
                                            Cancel Order
                                        </button>
                                    ) : (
                                        <div className="bg-gray-100 text-gray-500 font-bold py-2.5 px-6 rounded-xl border border-gray-200 flex items-center gap-2">
                                            Cancelled
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm text-center px-4">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-500 max-w-md">You haven't placed any orders yet. Once you make a purchase, tracking details will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrdersPage;