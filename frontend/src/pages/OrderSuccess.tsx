import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/auth/nav';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

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
        <div className='w-full min-h-screen flex flex-col'>
            <NavBar />
            <div className='flex-grow flex justify-center items-center p-4'>
                <div className='w-full max-w-2xl border border-neutral-300 rounded-lg flex flex-col p-8 bg-white shadow-lg text-center'>
                    {/* Success Icon */}
                    <div className='flex justify-center mb-6'>
                        <div className='w-20 h-20 bg-green-500 rounded-full flex items-center justify-center'>
                            <svg
                                className='w-12 h-12 text-white'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M5 13l4 4L19 7'
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Success Message */}
                    <h2 className='text-3xl font-bold text-green-600 mb-4'>Order Placed Successfully!</h2>
                    <p className='text-lg text-gray-700 mb-6'>
                        Thank you for your order. Your order has been successfully placed and is being processed.
                    </p>

                    {/* Order Details */}
                    <div className='bg-gray-50 p-6 rounded-md mb-6'>
                        <p className='text-gray-600 mb-2'>
                            You will receive an email confirmation shortly with your order details.
                        </p>
                        <p className='text-gray-600'>
                            You can track your order status in the &ldquo;My Orders&rdquo; section.
                        </p>
                    </div>

                    {/* Countdown Timer */}
                    <p className='text-sm text-gray-500 mb-6'>
                        Redirecting to My Orders in <span className='font-semibold text-green-600'>{countdown}</span> seconds...
                    </p>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <button
                            onClick={() => navigate('/myorders')}
                            className='bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors font-medium'
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className='bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium'
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
