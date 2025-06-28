import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Settings, Package } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useCartStore } from "../store/useCartStore.js";
import { useEffect } from "react";

const Navbar = () => {
    const { authUser, logout } = useAuthStore();
    const { getCartItemsCount, fetchCart } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (authUser) {
            fetchCart();
        }
    }, [authUser, fetchCart]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const cartItemsCount = getCartItemsCount();

    return (
        <div className="navbar bg-base-100 shadow-lg">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">
                    <Package className="w-6 h-6" />
                    AcsesuarStore
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/">Home</Link></li>
                    {authUser && (
                        <li><Link to="/orders">My Orders</Link></li>
                    )}
                    {authUser && authUser.role === 'admin' && (
                        <li><Link to="/admin">Admin Panel</Link></li>
                    )}
                </ul>
            </div>

            <div className="navbar-end">
                {authUser ? (
                    <>
                        {/* Cart */}
                        <Link to="/cart" className="btn btn-ghost btn-circle">
                            <div className="indicator">
                                <ShoppingCart className="w-5 h-5" />
                                {cartItemsCount > 0 && (
                                    <span className="badge badge-sm indicator-item badge-primary">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* User Dropdown */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <User className="w-5 h-5" />
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                                <li>
                                    <Link to="/profile" className="justify-between">
                                        Profile
                                        <span className="badge">{authUser.login}</span>
                                    </Link>
                                </li>
                                <li><Link to="/orders">My Orders</Link></li>
                                {authUser.role === 'admin' && (
                                    <li><Link to="/admin">Admin Panel</Link></li>
                                )}
                                <li>
                                    <button onClick={handleLogout}>
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-ghost">
                            Login
                        </Link>
                        <Link to="/signup" className="btn btn-primary">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;