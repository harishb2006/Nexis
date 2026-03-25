// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, Menu, X, Shield, Package, Store, Heart } from 'lucide-react';
import { logout } from '../../store/userActions';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const email = user.email;
    const isAdmin = user.role === 'admin';

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navLinkClasses = ({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
        } before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:origin-left before:scale-x-0 before:bg-indigo-600 before:transition-transform before:duration-300 hover:before:scale-x-100 ${isActive ? 'before:scale-x-100' : ''
        }`;

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-2' : 'bg-white py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center transition-all duration-300">

                    {/* Logo Section */}
                    <div className="flex items-center flex-shrink-0">
                        <NavLink to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-white font-black text-xl tracking-tighter">N</span>
                            </div>
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Nexis<span className="text-indigo-600">.</span></span>
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <NavLink to="/" end className={navLinkClasses}>
                            Home
                        </NavLink>
                        <NavLink to="/my-products" className={navLinkClasses}>
                            My products
                        </NavLink>
                        {email && (
                            <NavLink to="/myorders" className={navLinkClasses}>
                                Orders
                            </NavLink>
                        )}
                        <NavLink to="/profile" className={navLinkClasses}>
                            Contact
                        </NavLink>

                        {isAdmin && (
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) =>
                                    `ml-2 flex items-center gap-2 text-sm font-semibold transition-all duration-300 px-4 py-2 rounded-full ${isActive
                                        ? "bg-purple-100 text-purple-700 shadow-sm"
                                        : "bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                                    }`
                                }
                            >
                                <Shield size={16} className={({ isActive }) => isActive ? 'text-purple-600' : ''} />
                                Admin Panel
                            </NavLink>
                        )}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center space-x-5">
                        <NavLink
                            to="/wishlist"
                            className="relative p-2 text-gray-600 hover:text-rose-600 transition-colors duration-200 hover:bg-rose-50 rounded-full"
                            title="Wishlist"
                        >
                            <Heart size={22} strokeWidth={2.5} />
                        </NavLink>
                        <NavLink
                            to="/cart"
                            className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 rounded-full"
                            title="Cart"
                        >
                            <ShoppingCart size={22} strokeWidth={2.5} />
                        </NavLink>

                        {email ? (
                            <div className="hidden md:flex items-center space-x-4">
                                <NavLink
                                    to="/profile"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium text-sm group"
                                >
                                    <div className="p-1.5 bg-gray-100 group-hover:bg-indigo-100 transition-colors rounded-full">
                                        <User size={18} className="group-hover:text-indigo-600" />
                                    </div>
                                    <span className="truncate max-w-[120px]">{email.split('@')[0]}</span>
                                </NavLink>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <span>Logout</span>
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                <NavLink
                                    to="/login"
                                    className="text-gray-600 hover:text-indigo-600 font-medium text-sm px-4 py-2 transition-colors"
                                >
                                    Sign In
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5"
                                >
                                    Register
                                </NavLink>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar/Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 origin-top ${isOpen ? 'max-h-[500px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}>
                <div className="px-6 py-5 flex flex-col space-y-4">
                    <NavLink to="/" end className="flex items-center space-x-3 text-lg font-medium text-gray-800 hover:text-indigo-600" onClick={toggleMenu}>
                        <Store size={20} className="text-gray-400" />
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/my-products" className="flex items-center space-x-3 text-lg font-medium text-gray-800 hover:text-indigo-600" onClick={toggleMenu}>
                        <Package size={20} className="text-gray-400" />
                        <span>My products</span>
                    </NavLink>
                    {email && (
                        <NavLink to="/myorders" className="flex items-center space-x-3 text-lg font-medium text-gray-800 hover:text-indigo-600" onClick={toggleMenu}>
                            <ShoppingCart size={20} className="text-gray-400" />
                            <span>My Orders</span>
                        </NavLink>
                    )}

                    {isAdmin && (
                        <div className="pt-2 pb-1">
                            <NavLink to="/admin/dashboard" className="flex items-center space-x-3 text-lg font-medium text-purple-700 bg-purple-50 px-4 py-3 rounded-xl" onClick={toggleMenu}>
                                <Shield size={20} />
                                <span>Admin Dashboard</span>
                            </NavLink>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                        {email ? (
                            <>
                                <NavLink to="/profile" className="flex items-center space-x-3 text-lg font-medium text-gray-800 hover:text-indigo-600" onClick={toggleMenu}>
                                    <User size={20} className="text-gray-400" />
                                    <span>Profile ({email.split('@')[0]})</span>
                                </NavLink>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center justify-center space-x-2 w-full bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl font-semibold transition-colors mt-2">
                                    <LogOut size={18} />
                                    <span>Logout Account</span>
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <NavLink to="/login" className="flex justify-center items-center py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors" onClick={toggleMenu}>
                                    Sign In
                                </NavLink>
                                <NavLink to="/signup" className="flex justify-center items-center py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors" onClick={toggleMenu}>
                                    Register
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;