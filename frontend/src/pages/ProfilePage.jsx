import { useState } from "react";
import { User, Edit3, Save, X, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

const ProfilePage = () => {
    const { authUser, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        login: authUser?.login || "",
        password: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updateData = {};
        if (formData.login !== authUser.login) {
            updateData.login = formData.login;
        }
        if (formData.password) {
            updateData.password = formData.password;
        }

        if (Object.keys(updateData).length === 0) {
            setIsEditing(false);
            return;
        }

        const success = await updateProfile(updateData);
        if (success) {
            setIsEditing(false);
            setFormData({ ...formData, password: "" });
        }
    };

    const handleCancel = () => {
        setFormData({
            login: authUser?.login || "",
            password: "",
        });
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="card-title text-2xl">
                            <User className="w-6 h-6" />
                            Налаштування профілю
                        </h1>

                        {!isEditing && (
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 className="w-4 h-4" />
                                Редагувати
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Поле імені користувача */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Ім'я користувача</span>
                                </label>
                                <input
                                    type="text"
                                    name="login"
                                    className="input input-bordered"
                                    value={formData.login}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Поле пароля */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Новий пароль</span>
                                    <span className="label-text-alt text-gray-500">
                                        Залиште порожнім, щоб зберегти поточний пароль
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="input input-bordered w-full pr-10"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Введіть новий пароль"
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

                            {/* Кнопки дій */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={handleCancel}
                                >
                                    <X className="w-4 h-4" />
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    <Save className="w-4 h-4" />
                                    Зберегти зміни
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Відображення імені користувача */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Ім'я користувача</span>
                                </label>
                                <div className="input input-bordered bg-gray-50 cursor-not-allowed">
                                    {authUser?.login}
                                </div>
                            </div>

                            {/* Відображення ролі */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Роль</span>
                                </label>
                                <div className="input input-bordered bg-gray-50 cursor-not-allowed">
                                    <div className="flex items-center justify-between">
                                        <span>{authUser?.role}</span>
                                        <div className={`badge ${
                                            authUser?.role === 'admin' ? 'badge-primary' : 'badge-secondary'
                                        }`}>
                                            {authUser?.role === 'admin' ? 'Адміністратор' : 'Користувач'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Інформація про акаунт */}
                            <div className="bg-base-200 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Інформація про акаунт</h3>
                                <p className="text-sm text-gray-600">
                                    Ваш акаунт активний та готовий до використання. Ви можете оновити своє ім'я користувача та пароль в будь-який час.
                                </p>
                                {authUser?.role === 'admin' && (
                                    <div className="alert alert-info mt-3">
                                        <div>
                                            <span className="text-sm">
                                                У вас є права адміністратора, і ви можете управляти товарами та виконувати інші адміністративні завдання.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;