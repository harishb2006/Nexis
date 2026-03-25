import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import axios from '../../axiosConfig'
function Myproduct({ _id, name, images, description, price }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images]);

  const currentImage = images && images.length > 0 ? images[currentIndex] : null;
  const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleEdit = () => {
    navigate(`/create-product/${_id}`);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/v2/product/delete-product/${_id}`
      );
      if (response.status === 200) {
        alert("Product deleted successfully!");
        // Reload the page or fetch products again
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-white/80 backdrop-blur-md border border-gray-100 overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Image Area */}
      <div className="relative h-56 w-full bg-gradient-to-b from-gray-50/30 to-gray-100/30 flex items-center justify-center p-4 border-b border-gray-100/50 overflow-hidden">
        {currentImage ? (
          <img
            src={`${backendURL}${currentImage}`}
            alt={name}
            className="w-full h-full object-contain filter drop-shadow-sm transition-all duration-700 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="text-gray-400 font-medium absolute inset-0 flex items-center justify-center">No Image</div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{name}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow leading-relaxed">{description}</p>

        <div className="flex items-center justify-between mb-5">
          <div className="bg-indigo-50/80 text-indigo-700 font-black px-3 py-1 rounded-lg text-lg tracking-tight shrink-0 shadow-sm border border-indigo-100/50">
            ${Number(price).toFixed(2)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={handleEdit}
            className="px-3 py-2 text-sm font-semibold rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default Myproduct;