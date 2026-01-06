// src/components/NavBar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const email = useSelector((state) => state.user.email);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        dispatch({ type: 'SET_EMAIL', payload: '' });
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-orange-50 to-amber-50 shadow-md border-b border-orange-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <NavLink to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
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
                                    ? "text-orange-600 font-semibold transition-colors duration-200"
                                    : "text-gray-700 hover:text-orange-600 transition-colors duration-200"
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/my-products"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-orange-600 font-semibold transition-colors duration-200"
                                    : "text-gray-700 hover:text-orange-600 transition-colors duration-200"
                            }
                        >
                            Shop
                        </NavLink>
                        <NavLink
                            to="/myorders"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-orange-600 font-semibold transition-colors duration-200"
                                    : "text-gray-700 hover:text-orange-600 transition-colors duration-200"
                            }
                        >
                            Orders
                        </NavLink>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-orange-600 font-semibold transition-colors duration-200"
                                    : "text-gray-700 hover:text-orange-600 transition-colors duration-200"
                            }
                        >
                            Contact
                        </NavLink>
                    </div>

                    {/* Right Side - Cart & User */}
                    <div className="flex items-center space-x-4">
                        <NavLink to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-orange-600">
                            <ShoppingCart size={20} />
                        </NavLink>
                        
                        {email ? (
                            <div className="flex items-center space-x-3">
                                <NavLink to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-orange-600">
                                    <User size={20} />
                                    <span className="hidden lg:inline text-sm">{email.split('@')[0]}</span>
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden lg:inline text-sm">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <NavLink
                                to="/login"
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                            >
                                Login
                            </NavLink>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden text-gray-700 hover:text-orange-600"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-orange-100">
                    <div className="px-4 py-3 space-y-3">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-orange-600 font-semibold py-2"
                                    : "block text-gray-700 hover:text-orange-600 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/my-products"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-orange-600 font-semibold py-2"
                                    : "block text-gray-700 hover:text-orange-600 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Shop
                        </NavLink>
                        <NavLink
                            to="/create-product"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-orange-600 font-semibold py-2"
                                    : "block text-gray-700 hover:text-orange-600 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Add Products
                        </NavLink>
                        <NavLink
                            to="/myorders"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-orange-600 font-semibold py-2"
                                    : "block text-gray-700 hover:text-orange-600 py-2"
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            Orders
                        </NavLink>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive
                                    ? "block text-orange-600 font-semibold py-2"
                                    : "block text-gray-700 hover:text-orange-600 py-2"
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
                                className="block text-orange-600 font-semibold py-2"
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