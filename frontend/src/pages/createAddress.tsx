import React, { useState, FormEvent } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/auth/nav";
import { useSelector } from "react-redux";

// --- Type Definitions ---

interface RootState {
  user: {
    email: string | null;
  };
}

const CreateAddress: React.FC = () => {
    const navigate = useNavigate();
    
    // Get email from Redux state
    const email = useSelector((state: RootState) => state.user.email);
    
    const [country, setCountry] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [address1, setAddress1] = useState<string>("");
    const [address2, setAddress2] = useState<string>("");
    const [zipCode, setZipCode] = useState<string>("");
    const [addressType, setAddressType] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (!email) {
            alert("No email found in Redux state!");
            return;
        }

        setIsSubmitting(true);

        const addressData = {
            country,
            city,
            address1,
            address2,
            zipCode,
            addressType,
            email,
        };

        try {
            // Fixed the duplicate addressData parameter
            const response = await axios.post(
                "/api/v2/user/add-address", 
                addressData,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            
            if (response.status === 201) {
                navigate("/profile");
            }
        } catch (err: any) {
            console.error("Failed to add address", err);
            alert("Failed to add address. Please check the data and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <div className="w-full max-w-[550px] bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8 lg:p-10">
                    <div className="mb-8 text-center border-b border-gray-100 pb-6">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New <span className="text-indigo-600">Address</span></h1>
                        <p className="text-gray-500 mt-2 text-sm">Enter your shipping details below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Country</label>
                                <input
                                    type="text"
                                    value={country}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="e.g. India"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="e.g. Coimbatore"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Address Line 1</label>
                            <input
                                type="text"
                                value={address1}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                                onChange={(e) => setAddress1(e.target.value)}
                                placeholder="Street address, P.O. box, company name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide flex justify-between">
                                Address Line 2 <span className="text-gray-400 font-normal normal-case">Optional</span>
                            </label>
                            <input
                                type="text"
                                value={address2}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                                onChange={(e) => setAddress2(e.target.value)}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Zip Code</label>
                                <input
                                    type="number"
                                    value={zipCode}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="Postal code"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Address Type</label>
                                <select
                                    value={addressType}
                                    onChange={(e) => setAddressType(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900"
                                    required
                                >
                                    <option value="" disabled>Select Type</option>
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? 'Saving Address...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateAddress;