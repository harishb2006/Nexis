// src/components/NavBar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { logout } from '../../store/userActions';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const email = user.email;
    const isAdmin = user.role === 'admin';

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <NavLink to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold text-gray-800">shophub</span>
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-800 font-semibold transition-colors duration-200"
                                    : "text-gray-600 hover:text-slate-800 transition-colors duration-200"
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/my-products"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-800 font-semibold transition-colors duration-200"
                                    : "text-gray-600 hover:text-slate-800 transition-colors duration-200"
                            }
                        >
                            Shop
                        </NavLink>
                        <NavLink
                            to="/myorders"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-800 font-semibold transition-colors duration-200"
                                    : "text-gray-600 hover:text-slate-800 transition-colors duration-200"
                            }
                        >
                            Orders
                        </NavLink>
                        {isAdmin && (
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) =>
                                    isActive
                                        ? "flex items-center gap-2 text-slate-800 font-semibold transition-colors duration-200 bg-emerald-50 px-3 py-1.5 rounded-lg"
                                        : "flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors duration-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg"
                                }
                            >
                                <Shield size={18} />
                                Admin
                            </NavLink>
                        )}
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-800 font-semibold transition-colors duration-200"
                                    : "text-gray-600 hover:text-slate-800 transition-colors duration-200"
                            }
                        >
                            Contact
                        </NavLink>
                    </div>

                    {/* Right Side - Cart & User */}
                    <div className="flex items-center space-x-4">
                        <NavLink to="/cart" className="flex items-center space-x-2 text-gray-600 hover:text-slate-800">
                            <ShoppingCart size={20} />
                        </NavLink>
                        
                        {email ? (
                            <div className="flex items-center space-x-3">
                                <NavLink to="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-slate-800">
                                    <User size={20} />
                                    <span className="hidden lg:inline text-sm">
                                        {email.split('@')[0]}
                                        {isAdmin && <span className="ml-1 text-xs text-emerald-600 font-bold">(Admin)</span>}
                                    </span>
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-gray-600 hover:text-slate-800 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden lg:inline text-sm">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <NavLink
                                to="/login"
                                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
                            >
                                Login
                            </NavLink>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden text-gray-600 hover:text-slate-800"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 py-3 space-y-3">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-slate-800 font-semibold py-2"
                                    : "block text-gray-600 hover:text-slate-800 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/my-products"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-slate-800 font-semibold py-2"
                                    : "block text-gray-600 hover:text-slate-800 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Shop
                        </NavLink>
                        <NavLink
                            to="/create-product"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-slate-800 font-semibold py-2"
                                    : "block text-gray-600 hover:text-slate-800 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Add Products
                        </NavLink>
                        <NavLink
                            to="/myorders"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-slate-800 font-semibold py-2"
                                    : "block text-gray-600 hover:text-slate-800 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Orders
                        </NavLink>
                        {isAdmin && (
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) =>
                                    isActive
                                        ? "flex items-center gap-2 text-emerald-800 font-bold py-2 bg-emerald-50 px-2 rounded"
                                        : "flex items-center gap-2 text-emerald-700 hover:text-emerald-800 py-2"
                                }
                                onClick={() => setIsOpen(false)}
                            >
                                <Shield size={18} />
                                Admin Dashboard
                            </NavLink>
                        )}
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-slate-800 font-semibold py-2"
                                    : "block text-gray-600 hover:text-slate-800 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Profile
                        </NavLink>
                        {email ? (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="block w-full text-left text-red-600 hover:text-red-700 py-2"
                            >
                                Logout
                            </button>
                        ) : (
                            <NavLink
                                to="/login"
                                className="block text-slate-800 font-semibold py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavBar;