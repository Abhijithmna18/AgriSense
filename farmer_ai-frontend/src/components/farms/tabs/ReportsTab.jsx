import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { getAllDataForZone } from '../../../services/mockDataService';
import { generatePDF, generateJSON } from '../../../services/exportService';

const ReportsTab = ({ zone }) => {
    const [exportFormat, setExportFormat] = useState('pdf');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);

        try {
            // Get all data for the zone
            const allData = getAllDataForZone(zone._id);

            // Generate based on selected format
            if (exportFormat === 'pdf') {
                generatePDF(zone, allData);
            } else {
                generateJSON(zone, allData);
            }

            // Show success message
            setTimeout(() => {
                alert(`${exportFormat.toUpperCase()} report generated successfully!`);
                setGenerating(false);
            }, 500);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Farm Report</h3>
                <p className="text-sm text-gray-600">
                    Generate comprehensive reports with all zone data
                </p>
            </div>

            {/* Export Format Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Select Export Format</h4>

                <div className="space-y-3">
                    {/* PDF Option */}
                    <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${exportFormat === 'pdf'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input
                            type="radio"
                            name="exportFormat"
                            value="pdf"
                            checked={exportFormat === 'pdf'}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText size={20} className="text-red-600" />
                                <span className="font-semibold text-gray-800">PDF Report</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Formatted document with all zone details, lifecycle timeline, diary entries, harvest summary, and AI advisories
                            </p>
                            <div className="mt-2 text-xs text-gray-500">
                                <strong>Includes:</strong> Zone info • Lifecycle stages • Responsibilities • Diary entries (with images) • Harvest logs • AI recommendations
                            </div>
                        </div>
                    </label>

                    {/* JSON Option */}
                    <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${exportFormat === 'json'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input
                            type="radio"
                            name="exportFormat"
                            value="json"
                            checked={exportFormat === 'json'}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Download size={20} className="text-blue-600" />
                                <span className="font-semibold text-gray-800">JSON Data Export</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Raw structured data for integration with other systems or backup purposes
                            </p>
                            <div className="mt-2 text-xs text-gray-500">
                                <strong>Includes:</strong> All zone data in JSON format • Easy to import/process • Machine-readable
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Generate Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                    {generating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating {exportFormat.toUpperCase()}...
                        </>
                    ) : (
                        <>
                            <Download size={24} />
                            Generate {exportFormat.toUpperCase()} Report
                        </>
                    )}
                </button>
            </div>

            {/* Report Preview Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText size={18} />
                    What's Included
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span><strong>Zone Information:</strong> Name, crop, area, status, and sensor data</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span><strong>Crop Lifecycle:</strong> All stages with dates, notes, and progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span><strong>Responsibilities:</strong> All tasks with assignments and due dates</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span><strong>Field Diary:</strong> Recent entries with observations and incidents</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span><strong>Harvest Logs:</strong> Expected vs actual yields with quality grades</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span><strong>AI Advisories:</strong> Recommendations clearly labeled as advisory only</span>
                    </li>
                </ul>
            </div>

            {/* Important Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-2">📌 Important Note</h4>
                <p className="text-sm text-amber-800">
                    AI recommendations in the report are <strong>advisory only</strong> and should be verified by agricultural experts before implementation. They are clearly labeled in the exported document.
                </p>
            </div>
        </div>
    );
};

export default ReportsTab;
