import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const DataTable = ({
    columns,
    data,
    isLoading,
    pagination,
    onPageChange,
    onSort
}) => {
    if (isLoading) {
        return (
            <div className="w-full p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                Loading data...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full p-8 text-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
                No records found.
            </div>
        );
    }

    return (
        <div className="bg-[#111827] border border-[#374151] rounded-lg overflow-hidden shadow-sm">
            <div className="admin-table-container">
                <table className="admin-table w-full">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-6 py-3 text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-[#1f2937] transition-colors"
                                    onClick={() => onSort && col.sortable && onSort(col.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.title}
                                        {col.sortable && <ArrowUpDown size={14} className="text-gray-500" />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#374151]">
                        {data.map((row, idx) => (
                            <tr key={row._id || idx} className="hover:bg-[#1f2937] transition-colors">
                                {columns.map((col) => (
                                    <td key={`${row._id}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {pagination && (
                <div className="px-6 py-4 border-t border-[#374151] flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Page <span className="font-medium text-white">{pagination.currentPage}</span> of <span className="font-medium text-white">{pagination.totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="p-1 rounded-md hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            className="p-1 rounded-md hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
