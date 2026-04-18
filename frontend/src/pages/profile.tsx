import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressCard from "../components/auth/AddressCard";
import NavBar from "../components/auth/nav";
import { useSelector } from "react-redux";
import axios from "../axiosConfig";
// import axios from 'axios';
axios.defaults.withCredentials = true;

export default function Profile() {
  const email = useSelector((state: any) => state.user.email);

  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
  });
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    // Only fetch profile if email exists
    if (!email) return;
    // fetch(
    // 	`http://localhost:8000/api/v2/user/profile?email=${email}`,
    // 	{
    // 		method: "GET",
    // 		credentials: "include",
    // 	},

    // )
    // 	.then((res) => {
    // 		if (!res.ok) {
    // 			throw new Error(`HTTP error! status: ${res.status}`);
    // 		}
    // 		return res.json();
    // 	})
    // axios.get(`http://localhost:8000/api/v2/user/profile?email=${email}`, { withCredentials: true })
    // axios.get("/api/v2/user/profile", { params: { email } })
    axios.get("/api/v2/user/profile", {
      params: { email },
      withCredentials: true,
    })
      .then((res) => {
        setPersonalDetails(res.data.user);
        setAddresses(res.data.addresses);
      })
      .catch((err) => { });
  }, [email]);

  const handleAddAddress = () => {
    navigate("/create-address");
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

      <main className="relative z-10 pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your <span className="text-indigo-600">Profile</span></h1>
          <p className="text-gray-500 mt-2">Manage your personal details and addresses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Details Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20"></div>

              <div className="relative flex flex-col items-center mb-8 mt-4">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white mb-4">
                  <img
                    src={personalDetails.avatarUrl ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/${personalDetails.avatarUrl}` : `https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg`}
                    alt="profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg";
                    }}
                  />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{personalDetails.name || 'User'}</h2>
                <div className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-widest border border-indigo-100">
                  {personalDetails.role || 'Member'}
                </div>
              </div>

              <div className="space-y-6 flex-grow">
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100/60">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="font-medium text-gray-900 break-all">{personalDetails.email || 'Not provided'}</p>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100/60">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Number</p>
                  <p className="font-medium text-gray-900">{personalDetails.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Saved Addresses</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage delivery locations for quicker checkout</p>
                </div>
                <button
                  onClick={handleAddAddress}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md transform hover:-translate-y-0.5 shrink-0 flex items-center gap-2"
                >
                  <span>Add New</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No addresses saved</h3>
                  <p className="text-gray-500 max-w-sm">Add an address so it's ready when you checkout.</p>
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
}