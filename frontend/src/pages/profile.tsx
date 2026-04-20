import React, { useEffect, useState, SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import AddressCard from "../components/auth/AddressCard";
import NavBar from "../components/auth/nav";
import { useSelector } from "react-redux";
import axios from "../axiosConfig";

axios.defaults.withCredentials = true;

// --- Type Definitions ---

interface RootState {
  user: {
    email: string | null;
  };
}

interface PersonalDetails {
  name: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  role?: string;
}

interface Address {
  _id?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  addressType: string;
  [key: string]: any;
}

const Profile: React.FC = () => {
  const email = useSelector((state: RootState) => state.user.email);

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: "",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
  });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) return;

    axios.get("/api/v2/user/profile", {
      params: { email },
      withCredentials: true,
    })
      .then((res) => {
        setPersonalDetails(res.data.user);
        setAddresses(res.data.addresses);
      })
      .catch((err: any) => {
        console.error("Failed to fetch profile data", err);
      });
  }, [email]);

  const handleAddAddress = (): void => {
    navigate("/create-address");
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>): void => {
    e.currentTarget.src = "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg";
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

      <main className="relative z-10 pt-32 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left border-b border-gray-200/60 pb-6">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your <span className="text-indigo-600">Profile</span></h1>
          <p className="text-gray-500 mt-2 font-medium text-sm">Manage your personal details and addresses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Details Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 inset-x-0 h-32 bg-gray-50/50 border-b border-gray-100"></div>

              <div className="relative flex flex-col items-center mb-8 mt-4">
                <div className="w-32 h-32 rounded-[1.5rem] border-4 border-white shadow-sm overflow-hidden bg-white mb-5 rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={personalDetails.avatarUrl ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/${personalDetails.avatarUrl}` : `https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg`}
                    alt="profile"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{personalDetails.name || 'User'}</h2>
                <div className="mt-3 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-md uppercase tracking-widest">
                  {personalDetails.role || 'Member'}
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/60">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email Address</p>
                  <p className="font-bold text-sm text-gray-900 break-all">{personalDetails.email || 'Not provided'}</p>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/60">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Mobile Number</p>
                  <p className="font-bold text-sm text-gray-900">{personalDetails.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Saved Addresses</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">Manage delivery locations for quicker checkout</p>
                </div>
                <button
                  onClick={handleAddAddress}
                  className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0 uppercase tracking-wide border border-gray-800"
                >
                  Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-white/50 backdrop-blur-sm">
                  <div className="mb-4">
                      <span className="px-3 py-1.5 bg-gray-50 text-gray-400 font-black tracking-widest uppercase text-[10px] rounded-md border border-gray-200">No Addresses</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">No addresses saved</h3>
                  <p className="text-gray-500 text-sm font-medium max-w-sm">Add an address so it's ready when you checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address, index) => (
                    <AddressCard key={index} {...address} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;