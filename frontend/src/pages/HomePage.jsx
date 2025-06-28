import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { useProductStore } from "../store/useProductStore.js";
import { useCartStore } from "../store/useCartStore.js";
import { useAuthStore } from "../store/useAuthStore.js";

const HomePage = () => {
    const { products, fetchProducts, isLoading } = useProductStore();
    const { addToCart, isUpdating } = useCartStore();
    const { authUser } = useAuthStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Get unique categories
    const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddToCart = async (productId) => {
        if (!authUser) {
            toast.error("Please login to add items to cart");
            return;
        }
        await addToCart(productId, 1);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
                            <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                            <div className="card-body">
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                                <div className="h-8 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="hero min-h-[400px] bg-gradient-to-r from-primary to-secondary rounded-lg mb-8">
                <div className="hero-content text-center text-primary-content">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-5xl font-bold">Welcome to AcsesuarStore</h1>
                        <p className="mb-5">
                            Find the best accessories for your devices. Quality products at great prices!
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="form-control flex-1">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="input input-bordered flex-1"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-square">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="form-control">
                    <select
                        className="select select-bordered"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                        <figure className="h-48 bg-gray-100">
                            {product.imagePath ? (
                                <img
                                    src={`http://localhost:5000/${product.imagePath}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </figure>

                        <div className="card-body">
                            <h2 className="card-title text-sm">
                                {product.name}
                                {product.category && (
                                    <div className="badge badge-secondary badge-sm">
                                        {product.category}
                                    </div>
                                )}
                            </h2>

                            {product.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {product.description}
                                </p>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <span className="text-lg font-bold">
                                    ${product.price}
                                </span>

                                <div className="card-actions">
                                    <Link
                                        to={`/product/${product.id}`}
                                        className="btn btn-sm btn-outline"
                                    >
                                        View
                                    </Link>
                                    {authUser && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleAddToCart(product.id)}
                                            disabled={isUpdating}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;