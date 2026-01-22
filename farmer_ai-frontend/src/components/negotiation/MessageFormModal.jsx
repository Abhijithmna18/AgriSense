import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Paperclip, Upload, FileText, Image, File } from 'lucide-react';

const MessageFormModal = ({ form, setForm, onSubmit, onClose, submitting }) => {
    const fileInputRef = useRef(null);

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            if (!allowedTypes.includes(file.type)) {
                toast.error(`File ${file.name} has an unsupported format.`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            const newAttachments = validFiles.map(file => ({
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            }));

            setForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...newAttachments]
            }));
        }
    };

    const removeAttachment = (index) => {
        setForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
        if (type === 'application/pdf') return <FileText size={16} className="text-red-500" />;
        return <File size={16} className="text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.message.trim() && form.attachments.length === 0) return;
        onSubmit();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessageSquare size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Add Message</h2>
                            <p className="text-sm text-gray-600">Clarify or provide additional context</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Message Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Message
                        </label>
                        <textarea
                            value={form.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={6}
                            placeholder="Add clarification, ask questions, or provide additional context about your offer..."
                        />
                        <div className="text-xs text-gray-500">
                            {form.message.length}/1000 characters
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                Attachments (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Paperclip size={14} />
                                Add Files
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* File Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-1">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                Images, PDFs, Documents (Max 10MB each)
                            </p>
                        </div>

                        {/* Attachment List */}
                        {form.attachments.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">
                                    Attached Files ({form.attachments.length})
                                </h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {form.attachments.map((attachment, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            {attachment.preview ? (
                                                <img
                                                    src={attachment.preview}
                                                    alt={attachment.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                    {getFileIcon(attachment.type)}
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {attachment.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(attachment.size)}
                                                </p>
                                            </div>
                                            
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                <X size={14} className="text-gray-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Guidelines */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Message Guidelines:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Be specific and professional in your communication</li>
                            <li>• Attach relevant documents (specs, certificates, samples)</li>
                            <li>• Messages are tied to specific offers for audit purposes</li>
                            <li>• Avoid sharing sensitive business information</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={(!form.message.trim() && form.attachments.length === 0) || submitting}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default MessageFormModal;