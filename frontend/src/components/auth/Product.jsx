import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

function Product({ _id, name, images, description, price }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!images || images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [images]);

    const currentImage = images[currentIndex];
    const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    return (
      <div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/product/${_id}`)}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 h-64">
          <img
            src={`${backendURL}${currentImage}`}
            alt={name}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Quick Actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button 
              className="bg-white p-2 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Heart size={18} />
            </button>
            <button 
              className="bg-white p-2 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-600">${price.toFixed(2)}</span>
            </div>
            <button
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium text-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${_id}`);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
}

export default Product;