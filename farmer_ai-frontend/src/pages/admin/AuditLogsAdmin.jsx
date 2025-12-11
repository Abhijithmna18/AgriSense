import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import adminApi from '../../services/adminApi';
import { Clock, Shield } from 'lucide-react';

const AuditLogsAdmin = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            if (import.meta.env.VITE_USE_MOCK === 'true') {
                setLogs([
                    { _id: '1', action: 'SUSPEND_USER', entity: 'User', entityId: 'u123', adminId: { name: 'Admin', email: 'admin@test.com' }, timestamp: new Date().toISOString(), details: {} },
                    { _id: '2', action: 'CREATE_FLAG', entity: 'FeatureFlag', entityId: 'f1', adminId: { name: 'Admin', email: 'admin@test.com' }, timestamp: new Date(Date.now() - 86400000).toISOString(), details: {} },
                ]);
                setLoading(false);
                return;
            }

            const res = await adminApi.get('/admin/audit-logs');
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'action', title: 'Action', render: (row) => (
                <span className="font-mono text-yellow-400 font-medium">{row.action}</span>
            )
        },
        {
            key: 'entity', title: 'Entity', render: (row) => (
                <span className="text-gray-400 text-xs uppercase tracking-wide">{row.entity} <span className="text-gray-600">#{row.entityId?.substring(0, 6)}</span></span>
            )
        },
        {
            key: 'adminId', title: 'Admin', render: (row) => (
                <div className="flex items-center gap-2">
                    <Shield size={14} className="text-gray-500" />
                    <span className="text-white text-sm">{row.adminId?.email || 'System'}</span>
                </div>
            )
        },
        {
            key: 'timestamp', title: 'Time', render: (row) => (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock size={12} />
                    {new Date(row.timestamp).toLocaleString()}
                </div>
            )
        },
        {
            key: 'details', title: 'Details', render: (row) => (
                <div className="max-w-xs truncate text-xs text-gray-600 code">
                    {JSON.stringify(row.changes || row.details)}
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
            </div>

            <DataTable columns={columns} data={logs} isLoading={loading} />
        </div>
    );
};

export default AuditLogsAdmin;
