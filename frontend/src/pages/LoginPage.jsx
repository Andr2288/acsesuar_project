import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        login: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const { login, isLoggingIn } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.login || !formData.password) {
            return;
        }

        const success = await login(formData);
        if (success) {
            navigate("/");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-xl bg-base-100">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-center mb-6">
                        Welcome Back!
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Login Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="login"
                                    placeholder="Enter your username"
                                    className="input input-bordered w-full pl-10"
                                    value={formData.login}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    className="input input-bordered w-full pl-10 pr-10"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="divider">OR</div>

                    <div className="text-center">
                        <p className="text-sm">
                            Don't have an account?{" "}
                            <Link to="/signup" className="link link-primary">
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;