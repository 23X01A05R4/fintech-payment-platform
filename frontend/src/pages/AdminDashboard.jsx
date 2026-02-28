import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Database, RefreshCw, LogOut } from 'lucide-react';
import api from '../api';

const AdminDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/admin/transactions');
            setTransactions(data);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/dashboard'); // Kick out non-admins
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getStatusBadge = (status) => {
        if (status === 'Success') return <span className="text-xs font-semibold px-2 py-1 bg-success/20 text-success rounded-md border border-success/30">Success</span>;
        return <span className="text-xs font-semibold px-2 py-1 bg-danger/20 text-danger rounded-md border border-danger/30">Failed</span>;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldAlert className="text-primary-500" /> Admin Command Center
                    </h1>
                    <p className="text-fintech-500 mt-1">Live MongoDB Cloud Audit Logs</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fintech-800 hover:bg-fintech-700 border border-fintech-600 transition-colors"
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button
                        onClick={() => { localStorage.clear(); navigate('/'); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger border border-danger/50 transition-colors"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-fintech-700">
                <div className="bg-fintech-800/80 p-4 border-b border-fintech-700 flex items-center gap-2">
                    <Database size={18} className="text-primary-400" />
                    <h2 className="font-semibold text-white">mongodb.atlas.transaction_logs</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-fintech-900/50 text-fintech-400">
                            <tr>
                                <th className="p-4 font-semibold">Timestamp</th>
                                <th className="p-4 font-semibold">Transaction ID</th>
                                <th className="p-4 font-semibold">Invoice</th>
                                <th className="p-4 font-semibold">User ID</th>
                                <th className="p-4 font-semibold">Amount</th>
                                <th className="p-4 font-semibold">Attempt</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Gateway Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-fintech-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center"><RefreshCw className="animate-spin inline mr-2" /> Loading cloud logs...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-fintech-500">No telemetry data found.</td>
                                </tr>
                            ) : (
                                transactions.map((txn, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        key={txn._id}
                                        className="hover:bg-fintech-800/30 transition-colors"
                                    >
                                        <td className="p-4 text-fintech-400 truncate whitespace-nowrap">
                                            {new Date(txn.timestamp_iso).toLocaleString()}
                                        </td>
                                        <td className="p-4 font-mono text-primary-400 text-xs">
                                            {txn.transaction_id}
                                        </td>
                                        <td className="p-4">INV-{txn.invoice_id}</td>
                                        <td className="p-4 font-mono">USR-{txn.user_id}</td>
                                        <td className="p-4 font-bold text-white">${txn.amount.toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full bg-fintech-800 text-xs text-white">
                                                {txn.attempt}/3
                                            </span>
                                        </td>
                                        <td className="p-4">{getStatusBadge(txn.status)}</td>
                                        <td className="p-4">
                                            <span className={txn.status === 'Success' ? 'text-success/80' : 'text-danger/80'}>
                                                {txn.reason}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
