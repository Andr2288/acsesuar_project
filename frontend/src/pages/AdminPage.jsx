import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Upload, X, Save } from "lucide-react";
import { useProductStore } from "../store/useProductStore.js";
import toast from "react-hot-toast";

const AdminPage = () => {
    const {
        products,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
    } = useProductStore();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
    });

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            image: null,
        });
        setEditingProduct(null);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || "",
                price: product.price.toString(),
                category: product.category || "",
                image: null,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error("Name and price are required");
            return;
        }

        const productData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            image: formData.image,
        };

        let success;
        if (editingProduct) {
            success = await updateProduct(editingProduct.id, productData);
        } else {
            success = await createProduct(productData);
        }

        if (success) {
            handleCloseModal();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id);
        }
    };

    const categories = ["electronics", "accessories", "cables", "cases", "chargers", "other"];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Panel - Products</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => handleOpenModal()}
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <div className="w-16 h-16 bg-gray-100 rounded">
                                        {product.imagePath ? (
                                            <img
                                                src={`http://localhost:5000/${product.imagePath}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div className="font-bold">{product.name}</div>
                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                            {product.description}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="badge badge-ghost">
                                        {product.category || "None"}
                                    </div>
                                </td>
                                <td className="font-bold">${product.price}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handleOpenModal(product)}
                                            disabled={isUpdating}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-error"
                                            onClick={() => handleDelete(product.id)}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No products found. Add your first product!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                {editingProduct ? "Edit Product" : "Add New Product"}
                            </h3>
                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={handleCloseModal}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Product Name *</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="input input-bordered"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Description</span>
                                </label>
                                <textarea
                                    name="description"
                                    className="textarea textarea-bordered"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Price *</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        min="0"
                                        className="input input-bordered"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Category</span>
                                    </label>
                                    <select
                                        name="category"
                                        className="select select-bordered"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Product Image</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="file-input file-input-bordered"
                                    onChange={handleFileChange}
                                />
                                {editingProduct && !formData.image && (
                                    <label className="label">
                                        <span className="label-text-alt">
                                            Leave empty to keep current image
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isCreating || isUpdating}
                                >
                                    {(isCreating || isUpdating) ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {editingProduct ? "Update" : "Create"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;