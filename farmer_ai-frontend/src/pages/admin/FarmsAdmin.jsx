import React from 'react';
import DataTable from '../../components/admin/DataTable';
import api from '../../services/authApi';

const FarmsAdmin = () => {
    const [farms, setFarms] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFarms = async () => {
            try {
                const { data } = await api.get('/api/farms/admin/all');
                setFarms(data.data);
            } catch (error) {
                console.error("Failed to fetch farms", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFarms();
    }, []);

    const columns = [
        { key: 'name', title: 'Farm Name' },
        {
            key: 'owner',
            title: 'Owner',
            render: (row) => row.user ? `${row.user.firstName} ${row.user.lastName}` : 'Unknown'
        },
        {
            key: 'location',
            title: 'Location',
            render: (row) => row.location ? `${row.location.district}, ${row.location.state}` : 'N/A'
        },
        {
            key: 'area',
            title: 'Area (Acres)',
            render: (row) => row.totalArea
        },
        { key: 'irrigationType', title: 'Irrigation' }
    ];

    if (loading) return <div className="p-8 text-white">Loading farms...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Farms Management</h1>
            <div className="bg-[var(--admin-bg-secondary)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
                <DataTable
                    columns={columns}
                    data={farms}
                    actions={[
                        {
                            label: 'Details',
                            onClick: (row) => console.log('View', row),
                            className: 'text-blue-400 hover:text-blue-300'
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default FarmsAdmin;
