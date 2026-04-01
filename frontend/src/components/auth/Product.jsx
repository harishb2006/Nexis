import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "../../axiosConfig";

function Product({ _id, name, images, description, price, createdAt, userWishlist = [], onToggleWishlist }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const email = user?.email;

  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images]);

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!email) {
      alert("Please login to add to wishlist");
      navigate('/login');
      return;
    }

    // Optimistic UI update
    if (onToggleWishlist) onToggleWishlist();

    try {
      await axios.post('/api/v2/product/wishlist', {
        email,
        productId: _id
      });
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      // Revert optimistic update
      if (onToggleWishlist) onToggleWishlist();
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!email) {
      alert("Please login to add to cart");
      navigate('/login');
      return;
    }
    try {
      await axios.post('/api/v2/product/cart', {
        userId: email,
        productId: _id,
        quantity: 1
      });
      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Failed to add to cart", error);
      alert("Failed to add to cart");
    }
  };

  const isNewProduct = () => {
    const now = new Date();
    const productDate = new Date(createdAt);

    const diffTime = now - productDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays <= 3; // change to 3 or 1 if needed
  };

  const currentImage = images && images.length > 0 ? images[currentIndex] : null;
  const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div
      className="group relative flex flex-col h-full bg-transparent overflow-hidden rounded-2xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${_id}`)}
    >
      {/* Image Showcase */}
      <div className="relative h-64 w-full bg-gradient-to-b from-gray-50/30 to-gray-100/30 overflow-hidden flex items-center justify-center p-6 border-b border-gray-100/50">
        {currentImage ? (
          <>
            <img
              src={`${backendURL}${currentImage}`}
              alt={name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
              className="w-full h-full object-contain filter drop-shadow-sm transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-xl"
            />
            <div className="hidden text-gray-400 font-medium absolute inset-0 items-center justify-center z-0">No Image</div>
          </>
        ) : (
          <div className="text-gray-400 font-medium absolute inset-0 flex items-center justify-center z-0">No Image</div>
        )}

        {/* Top Badge */}
        {isNewProduct() && (
          <div className="absolute top-4 left-4 transition-transform duration-300 group-hover:scale-105 z-10">
            <span className="bg-white/90 backdrop-blur-md text-xs font-extrabold tracking-wide px-3 py-1.5 rounded-full text-indigo-600 shadow-sm border border-indigo-50/50 uppercase">
              New
            </span>
          </div>
        )}

        {/* Quick Actions overlay */}
        <div className={`absolute top-4 right-4 flex flex-col gap-3 transition-all duration-500 ease-out ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          <button
            title="Add to Wishlist"
            className={`bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg transition-all border border-gray-50 focus:outline-none ${userWishlist.includes(_id) ? 'text-rose-500 bg-rose-50 shadow-rose-100' : 'text-gray-500 hover:bg-rose-50 hover:text-rose-500 hover:shadow-rose-100'
              }`}
            onClick={handleToggleWishlist}
          >
            <Heart size={18} className={`transition-all ${userWishlist.includes(_id) ? 'fill-rose-500' : ''}`} />
          </button>
          <button
            title="Add to Cart"
            className="bg-white/90 backdrop-blur-md p-2.5 text-gray-500 rounded-full shadow-lg hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-indigo-100 transition-all border border-gray-50 focus:outline-none"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} className="transition-all" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow bg-transparent">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{name}</h3>
          <div className="bg-indigo-50/80 text-indigo-700 font-black px-3 py-1 rounded-lg text-lg tracking-tight shrink-0 shadow-sm border border-indigo-100/50">
            ₹{Number(price).toFixed(2)}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{description}</p>

        <div className="mt-auto pt-4 border-t border-gray-200/60 flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase group-hover:text-indigo-500 transition-colors">View Details</span>
          <div className="w-8 h-8 rounded-full bg-gray-50/80 flex items-center justify-center group-hover:bg-indigo-600 group-hover:shadow-md transition-all duration-300">
            <ArrowRight size={16} className="text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div >
  );
}

export default Product;