import React from "react";
import { MapPin, Building, Globe, Hash, Home } from "lucide-react";

// 1. Define the props interface for the component
interface AddressCardProps {
    country: string;
    city: string;
    address1: string;
    address2?: string; // Optional property
    zipCode: string | number; // Accepts both depending on your backend
    addressType?: string; // Optional property
}

// 2. Apply the interface to the functional component
const AddressCard: React.FC<AddressCardProps> = ({ 
    country, 
    city, 
    address1, 
    address2, 
    zipCode, 
    addressType 
}) => {
    return (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80"></div>

            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        {addressType?.toLowerCase() === 'home' || addressType?.toLowerCase() === 'residential' ? (
                            <Home size={20} />
                        ) : (
                            <Building size={20} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 capitalize tracking-tight">{addressType || "Address"}</h3>
                        <p className="text-sm text-gray-400 font-medium">Saved Location</p>
                    </div>
                </div>
                <span className="bg-green-50 text-green-700 border border-green-100 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Active
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
                    <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-[10px] mb-1">Street Address</p>
                        <p className="font-medium text-gray-900 leading-tight block">{address1} {address2 && <span><br />{address2}</span>}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
                        <Building size={18} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-[10px] mb-1">City</p>
                            <p className="font-medium text-gray-900">{city}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
                        <Hash size={18} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-[10px] mb-1">ZIP Code</p>
                            <p className="font-medium text-gray-900">{zipCode}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors bg-gray-50/30">
                    <Globe size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-[10px] mb-1">Country</p>
                        <p className="font-medium text-gray-900">{country}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressCard;