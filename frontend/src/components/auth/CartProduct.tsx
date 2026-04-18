import React, { useState, useEffect } from "react";
import { IoIosAdd } from "react-icons/io";
import { IoIosRemove } from "react-icons/io";
import axios from '../../axiosConfig';
import { useSelector } from "react-redux";

// 1. Define the props interface for the component
interface CartProductProps {
    _id: string;
    name: string;
    images?: string[];
    quantity: number;
    price: number | string;
}

// 2. Define the shape of your Redux state
interface RootState {
    user: {
        email: string | null;
    };
}

const CartProduct: React.FC<CartProductProps> = ({ 
    _id, 
    name, 
    images = [], 
    quantity, 
    price 
}) => {
    // 3. Explicitly type the component state
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [quantityVal, setQuantityVal] = useState<number>(quantity);

    // 4. Use the RootState interface
    const email = useSelector((state: RootState) => state.user.email);

    useEffect(() => {
        if (!images || images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [images]);

    const backendURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

    const handleIncrement = (): void => {
        const newquantityVal = quantityVal + 1;
        setQuantityVal(newquantityVal);
        updateQuantityVal(newquantityVal);
    };

    const handleDecrement = (): void => {
        const newquantityVal = quantityVal > 1 ? quantityVal - 1 : 1;
        setQuantityVal(newquantityVal);
        updateQuantityVal(newquantityVal);
    };

    // 5. Type the parameter and the return type of the async function
    const updateQuantityVal = async (newQuantity: number): Promise<void> => {
        try {
            await axios.put("/api/v2/product/cartproduct/quantity", {
                email,
                productId: _id,
                quantity: newQuantity,
            });
        } catch (err: any) {
            console.error("Failed to update quantity:", err);
        }
    };

    const currentImage = images && images.length > 0 ? images[currentIndex] : "";

    return (
        <div className="flex flex-col sm:flex-row bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm transition-shadow hover:shadow-md group gap-6 items-center w-full">
            {/* Product Image */}
            <div className="relative w-full sm:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-gray-100 transition-colors">
                {currentImage ? (
                    <img
                        src={currentImage.startsWith('http') ? currentImage : `${backendURL}${currentImage}`}
                        alt={name}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-500 group-hover:scale-110 p-2"
                    />
                ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                )}
            </div>

            {/* Product Info */}
            <div className="flex-grow flex flex-col justify-between h-full py-1">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{name}</h3>
                    <p className="text-indigo-600 font-extrabold text-xl">₹{Number(price).toFixed(2)}</p>
                </div>
            </div>

            {/* Actions (Quantity + Total) */}
            <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 sm:gap-4 shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200/60 shadow-inner">
                    <button
                        onClick={handleDecrement}
                        className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 shadow-sm hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
                        disabled={quantityVal <= 1}
                    >
                        <IoIosRemove size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-900 select-none">
                        {quantityVal}
                    </span>
                    <button
                        onClick={handleIncrement}
                        className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 shadow-sm hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
                    >
                        <IoIosAdd size={16} />
                    </button>
                </div>

                <div className="text-right sm:text-center min-w-[100px]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Subtotal</p>
                    {/* Wrapped price in Number() to guarantee safe math operations */}
                    <p className="text-xl font-black text-gray-900">₹{(Number(price) * quantityVal).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default CartProduct;