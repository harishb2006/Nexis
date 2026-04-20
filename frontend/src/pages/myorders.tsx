import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import NavBar from '../components/auth/nav';
import { useSelector } from 'react-redux';

// --- Type Definitions ---

interface RootState {
    user: {
        email: string | null;
    };
}

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface ShippingAddress {
    address1: string;
    address2?: string;
    city: string;
    zipCode: string;
    country: string;
    addressType: string;
}

interface Order {
    _id: string;
    totalAmount: number;
    orderStatus: string;
    shippingAddress: ShippingAddress;
    orderItems: OrderItem[];
}

const MyOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    const email = useSelector((state: RootState) => state.user.email);

    const fetchOrders = async (): Promise<void> => {
        if (!email) return;
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/v2/orders/myorders', {
                params: { email: email },
            });
            setOrders(response.data.orders);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    // Cancel order handler
    const cancelOrder = async (orderId: string): Promise<void> => {
        try {
            const response = await axios.patch(`/api/v2/orders/cancel-order/${orderId}`);
            // Update the order in local state: update its status.
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, orderStatus: response.data.order.orderStatus } : order
                )
            );
            fetchOrders();
        } catch (err: any) {
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
            <main className="relative z-10 pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-gray-200/60 pb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My <span className="text-indigo-600">Orders</span></h1>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Track and manage your recent purchases</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-sm font-bold tracking-widest uppercase text-indigo-600 animate-pulse">Loading orders...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-sm border border-red-100 text-center text-sm font-semibold">{error}</div>
                ) : orders.length > 0 ? (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-5 sm:p-6 relative overflow-hidden group"
                            >
                                {/* Status indicator line */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${order.orderStatus === 'Cancelled' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Order ID</p>
                                        <p className="font-mono text-sm text-gray-900 font-bold">{order._id}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                                        <p className="text-xl font-black text-indigo-600">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                    <div className="bg-gray-50/50 rounded-xl p-4 sm:p-5 border border-gray-100/60">
                                        <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Shipping Address</h2>
                                        <div className="text-gray-600 text-xs space-y-1">
                                            <p className="font-bold text-gray-900 text-sm">
                                                {order.shippingAddress.address1}
                                                {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                                            </p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                                            <p>{order.shippingAddress.country}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black tracking-widest rounded uppercase border border-indigo-100">
                                                {order.shippingAddress.addressType}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-4 sm:p-5 border border-gray-100/60">
                                        <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Order Items</h2>
                                        <ul className="space-y-2">
                                            {order.orderItems.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-gray-800 font-semibold truncate pr-3">{item.name} <span className="text-gray-400 ml-1">x{item.quantity}</span></span>
                                                    <span className="font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    {order.orderStatus !== 'Cancelled' ? (
                                        <button
                                            onClick={() => cancelOrder(order._id)}
                                            className="bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs py-2 px-5 rounded-lg transition-all border border-gray-200 hover:border-rose-200 shadow-sm"
                                        >
                                            Cancel Order
                                        </button>
                                    ) : (
                                        <div className="bg-gray-50 text-gray-400 font-bold text-xs py-2 px-5 rounded-lg border border-gray-200 flex items-center gap-2 uppercase tracking-wider">
                                            Cancelled
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm text-center px-4">
                        <div className="mb-4">
                            <span className="px-3 py-1.5 bg-gray-50 text-gray-400 font-black tracking-widest uppercase text-[10px] rounded-md border border-gray-200">Empty Record</span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-500 font-medium max-w-sm text-xs">You haven't placed any orders yet. Once you make a purchase, tracking details will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrdersPage;