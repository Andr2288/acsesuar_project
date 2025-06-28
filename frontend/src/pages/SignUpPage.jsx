import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, CheckCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        login: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const { signup, isSigningUp } = useAuthStore();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.login.trim()) {
            newErrors.login = "Username is required";
        } else if (formData.login.length < 3) {
            newErrors.login = "Username must be at least 3 characters";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const success = await signup({
            login: formData.login,
            password: formData.password,
        });

        if (success) {
            navigate("/login");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-xl bg-base-100">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-center mb-6">
                        Create Account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 z-10" />
                                </div>
                                <input
                                    type="text"
                                    name="login"
                                    placeholder="Choose a username"
                                    className={`input input-bordered w-full pl-10 ${
                                        errors.login ? "input-error" : ""
                                    }`}
                                    value={formData.login}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {errors.login && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.login}</span>
                                </label>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 z-10" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a password"
                                    className={`input input-bordered w-full pl-10 pr-10 ${
                                        errors.password ? "input-error" : ""
                                    }`}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 z-10" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 z-10" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.password}</span>
                                </label>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Confirm Password</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CheckCircle className="h-5 w-5 text-gray-400 z-10" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    className={`input input-bordered w-full pl-10 pr-10 ${
                                        errors.confirmPassword ? "input-error" : ""
                                    }`}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 z-10" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 z-10" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSigningUp}
                            >
                                {isSigningUp ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="divider">OR</div>

                    <div className="text-center">
                        <p className="text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="link link-primary">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;