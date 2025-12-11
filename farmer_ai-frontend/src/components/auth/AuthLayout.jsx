import React from 'react';
import AuthBrandPanel from './AuthBrandPanel';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Panel - Brand */}
            <AuthBrandPanel />

            {/* Right Panel - Form */}
            <div className="flex items-center justify-center bg-soft-light-bg p-6 sm:p-12">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
