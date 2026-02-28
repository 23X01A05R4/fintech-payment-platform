import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Mail, User } from 'lucide-react';
import api from '../api';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await api.post('/auth/register', formData);
                setIsRegister(false);
            } else {
                const formDataObj = new FormData();
                formDataObj.append('username', formData.email);
                formDataObj.append('password', formData.password);
                const { data } = await api.post('/auth/login', formDataObj);
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 rounded-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-fintech-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-primary-400 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                        <Lock className="text-white" size={28} />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-fintech-500 mt-2 text-sm">Fintech Payment Portal</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-danger/20 border border-danger/50 text-danger rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    {isRegister && (
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-fintech-500" size={18} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full bg-fintech-900/50 border border-fintech-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-fintech-500" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full bg-fintech-900/50 border border-fintech-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-fintech-500" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="w-full bg-fintech-900/50 border border-fintech-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-500/25 mt-4 transition-all opacity-100 disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : (isRegister ? 'Register' : 'Secure Login')}
                    </motion.button>
                </form>

                <p className="text-center mt-6 text-sm text-fintech-500">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        type="button"
                        className="text-primary-400 font-medium ml-2 hover:text-primary-300 transition-colors"
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? 'Login' : 'Register'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
