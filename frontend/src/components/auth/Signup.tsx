import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCloudUpload } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import axios from '../../axiosConfig';
import ValidationFormObject from "../../validation";
import { useDispatch } from 'react-redux';
import { setemail } from "../../store/userActions";

const Signup: React.FC = () => {
  // Primitives are automatically inferred by TS (string, boolean)
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Explicitly type complex state
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle avatar preview and cleanup
  useEffect(() => {
    if (!avatar) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatar);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  // Typed the change event for the file input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Added optional chaining
    if (file) setAvatar(file);
  };

  const validateFields = (): boolean => {
    const nameError = ValidationFormObject.validteName(name);
    const emailError = ValidationFormObject.validteEmail(email);
    const passwordError = ValidationFormObject.validtePass(password);

    // Replaced 'any' with a strict Record type
    const newErrors: Record<string, string> = {};
    
    if (nameError !== true) newErrors.name = nameError as string;
    if (emailError !== true) newErrors.email = emailError as string;
    if (passwordError !== true) newErrors.password = passwordError as string;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Typed the form submission event
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    const formData = new FormData();
    if (avatar) {
        formData.append("file", avatar);
    }
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);

    try {
      await axios.post("/api/v2/user/create-user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(setemail(email));
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Join our community today
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/60 sm:rounded-2xl border border-slate-100 sm:px-12">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <RxAvatar className="h-16 w-16 text-slate-300" />
                  )}
                </div>
                <label
                  htmlFor="file-input"
                  className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-transform hover:scale-110"
                >
                  <AiOutlineCloudUpload size={18} />
                  <input
                    type="file"
                    id="file-input"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500 font-medium">Upload profile photo</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors['name'] ? "border-red-400" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {errors['name'] && <p className="text-red-500 text-xs mt-1">{errors['name']}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors['email'] ? "border-red-400" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {errors['email'] && <p className="text-red-500 text-xs mt-1">{errors['email']}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={visible ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      errors['password'] ? "border-red-400" : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {visible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                  </button>
                </div>
                {errors['password'] && <p className="text-red-500 text-xs mt-1">{errors['password']}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Join as</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm appearance-none"
                >
                  <option value="user">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;