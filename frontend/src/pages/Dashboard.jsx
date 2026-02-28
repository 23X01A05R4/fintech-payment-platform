import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, RefreshCw, Plus, CheckCircle, XCircle, Clock, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

const Dashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [newAmount, setNewAmount] = useState('');
    const [qrModalOpen, setQrModalOpen] = useState(null);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchInvoices = async () => {
        try {
            const { data } = await api.get('/invoices/');
            setInvoices(data);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        if (!newAmount) return;
        try {
            await api.post('/invoices/', { amount: parseFloat(newAmount) });
            setNewAmount('');
            fetchInvoices();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePay = async (invoiceId) => {
        setPaymentStatus({ id: invoiceId, status: 'processing' });
        try {
            const { data } = await api.post('/payments/pay', { invoice_id: invoiceId });
            setPaymentStatus({
                id: invoiceId,
                status: data.status.toLowerCase(),
                reason: data.reason,
                flagged: data.fraud_flag
            });
            await fetchInvoices();
        } catch (err) {
            setPaymentStatus({
                id: invoiceId,
                status: 'error',
                reason: err.response?.data?.detail || 'System Error'
            });
            await fetchInvoices();
        }

        // Clear notification after 5s
        setTimeout(() => {
            setPaymentStatus(null);
        }, 5000);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-success/20 text-success border-success/30';
            case 'failed': return 'bg-danger/20 text-danger border-danger/30';
            default: return 'bg-warning/20 text-warning border-warning/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle size={14} className="mr-1" />;
            case 'failed': return <XCircle size={14} className="mr-1" />;
            default: return <Clock size={14} className="mr-1" />;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Hello, {user.name}</h1>
                    <p className="text-fintech-500">Manage your outstanding balances securely.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fintech-800 hover:bg-fintech-700 transition-colors border border-fintech-700 text-fintech-100"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <AnimatePresence>
                {paymentStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-lg ${paymentStatus.status === 'success' || paymentStatus.status === 'paid'
                            ? 'bg-success/10 border-success/50 text-success'
                            : paymentStatus.status === 'processing'
                                ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                                : 'bg-danger/10 border-danger/50 text-danger'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {paymentStatus.status === 'processing' ? (
                                <RefreshCw className="animate-spin" />
                            ) : paymentStatus.status === 'success' || paymentStatus.status === 'paid' ? (
                                <CheckCircle />
                            ) : (
                                <XCircle />
                            )}
                            <div>
                                <p className="font-semibold capitalize">
                                    {paymentStatus.status === 'processing' ? 'Processing Transaction...' : paymentStatus.status}
                                </p>
                                {paymentStatus.reason && <p className="text-sm opacity-80">{paymentStatus.reason}</p>}
                                {paymentStatus.flagged && (
                                    <p className="text-sm font-bold mt-1 text-warning">⚠️ Account Flagged: Too many recent attempts</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {qrModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setQrModalOpen(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-fintech-900 border border-fintech-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-fintech-400"></div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Scan to Pay</h3>
                            <p className="text-fintech-400 text-sm mb-6">Open your mobile banking app and scan this QR code to securely pay.</p>

                            <div className="bg-white p-4 rounded-2xl mx-auto w-fit mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <QRCodeSVG
                                    value={JSON.stringify({
                                        invoice_id: `INV-${qrModalOpen.id.toString().padStart(4, '0')}`,
                                        amount: qrModalOpen.amount,
                                        user: user.email,
                                        timestamp: new Date().toISOString()
                                    })}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="text-3xl font-bold mb-6 tracking-tight text-white">${qrModalOpen.amount.toFixed(2)}</div>

                            <button
                                onClick={() => {
                                    handlePay(qrModalOpen.id);
                                    setQrModalOpen(null);
                                }}
                                className="w-full bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-3"
                            >
                                <CheckCircle size={18} /> Simulate App Scan
                            </button>
                            <button
                                onClick={() => setQrModalOpen(null)}
                                className="w-full text-fintech-400 hover:text-white transition-colors py-2 text-sm font-medium"
                            >
                                Close & Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Your Invoices</h2>
                    {loading ? (
                        <div className="flex justify-center py-12"><RefreshCw className="animate-spin text-primary-500" /></div>
                    ) : invoices.length === 0 ? (
                        <div className="glass-card p-8 text-center rounded-2xl text-fintech-500">
                            No invoices found. Create one to test the payment flow.
                        </div>
                    ) : (
                        invoices.map((inv) => (
                            <motion.div
                                layout
                                key={inv.id}
                                className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-fintech-800/80"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-white">INV-{inv.id.toString().padStart(4, '0')}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center ${getStatusColor(inv.status)}`}>
                                            {getStatusIcon(inv.status)} {inv.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-fintech-500">
                                        Created: {new Date(inv.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold tracking-tight">${inv.amount.toFixed(2)}</p>
                                        <p className="text-xs text-fintech-500">
                                            Attempts: {inv.retry_count}/3
                                        </p>
                                    </div>

                                    {inv.status !== 'paid' && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => setQrModalOpen(inv)}
                                                disabled={inv.retry_count >= 3 || paymentStatus?.status === 'processing'}
                                                className={`p-2.5 rounded-xl font-semibold transition-all border shadow-lg flex items-center justify-center min-w-[44px] ${inv.retry_count >= 3
                                                    ? 'text-fintech-500 border-fintech-700 cursor-not-allowed bg-fintech-800/50'
                                                    : 'text-primary-400 hover:text-white border-fintech-600 hover:bg-fintech-700 hover:border-primary-500/50'
                                                    }`}
                                                title="Show QR Code"
                                            >
                                                <QrCode size={20} />
                                            </button>
                                            <button
                                                onClick={() => handlePay(inv.id)}
                                                disabled={inv.retry_count >= 3 || paymentStatus?.status === 'processing'}
                                                className={`px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center flex-1 gap-2 ${inv.retry_count >= 3
                                                    ? 'bg-fintech-700 text-fintech-500 cursor-not-allowed border border-fintech-600'
                                                    : 'bg-primary-500 hover:bg-primary-400 text-white shadow-primary-500/25'
                                                    }`}
                                            >
                                                {inv.retry_count > 0 && inv.retry_count < 3 ? 'Retry Pay' : 'Pay Now'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div>
                    <div className="glass-card p-6 rounded-2xl sticky top-24">
                        <h2 className="text-xl font-semibold mb-4">Simulate Invoice</h2>
                        <form onSubmit={handleCreateInvoice}>
                            <div className="relative mb-4">
                                <span className="absolute left-3 top-3 text-fintech-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    className="w-full bg-fintech-900/50 border border-fintech-700 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-fintech-800 hover:bg-fintech-700 text-white border border-fintech-600 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Generate Invoice
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-fintech-700">
                            <h3 className="text-sm font-semibold text-fintech-500 mb-2 uppercase tracking-wider">How to test</h3>
                            <ul className="text-sm text-fintech-400 space-y-2">
                                <li>1. Click "Pay Now"</li>
                                <li>2. System randomly Simulates Success (40%), Failure (30%), or Timeout (30%)</li>
                                <li>3. Watch the retry count increment</li>
                                <li>4. Button disables safely at 3 retries</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
