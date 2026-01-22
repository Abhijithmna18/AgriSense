import React, { useState } from 'react';
import { Edit2, Save, X, MapPin, Ruler, Droplets } from 'lucide-react';
import { useFarmIntelligence } from '../../context/FarmIntelligenceContext';

const FarmProfileCard = () => {
    const { intelligence, updateFarmProfile } = useFarmIntelligence();
    const farm = intelligence?.farmProfile;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    if (!farm) return <div className="p-4 bg-white rounded-xl animate-pulse h-64"></div>;

    const handleEdit = () => {
        setFormData({
            name: farm.name,
            totalArea: farm.totalArea,
            irrigationType: farm.irrigationType,
            soilType: farm.soilType,
            district: farm.location?.district || '',
            state: farm.location?.state || ''
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        // Construct update object
        const update = {
            name: formData.name,
            totalArea: Number(formData.totalArea),
            irrigationType: formData.irrigationType,
            soilType: formData.soilType,
            location: {
                ...farm.location,
                district: formData.district,
                state: formData.state
            }
        };

        const success = await updateFarmProfile(farm._id, update);
        if (success) setIsEditing(false);
    };

    const Field = ({ label, value, name, type = "text", options }) => (
        <div className="mb-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
            {isEditing ? (
                options ? (
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                    >
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                )
            ) : (
                <div className="text-gray-800 font-medium">{value || 'N/A'}</div>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                    <MapPin size={18} /> Farm Profile
                </h3>
                {!isEditing ? (
                    <button onClick={handleEdit} className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-200 transition">
                        <Edit2 size={16} />
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 p-1">
                            <X size={18} />
                        </button>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800 p-1">
                            <Save size={18} />
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                <Field label="Farm Name" value={farm.name} name="name" />

                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Total Area (Acres)"
                        value={`${farm.totalArea} Acres`}
                        name="totalArea"
                        type="number"
                    />
                    <Field
                        label="Irrigation"
                        value={farm.irrigationType}
                        name="irrigationType"
                        options={['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler']}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Soil Type"
                        value={farm.soilType}
                        name="soilType"
                        options={['Sandy', 'Loamy', 'Clay', 'Black', 'Red', 'Mixed']}
                    />
                    <Field
                        label="District"
                        value={farm.location?.district}
                        name="district"
                    />
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Readiness Score</span>
                        <span className={`font-bold ${farm.dataReadinessScore > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                            {farm.dataReadinessScore}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <div
                            className={`h-1.5 rounded-full ${farm.dataReadinessScore > 70 ? 'bg-green-500' : 'bg-orange-400'}`}
                            style={{ width: `${farm.dataReadinessScore}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmProfileCard;
