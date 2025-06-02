"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface LoginPopupProps {
  show: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
  onContinueAsGuest: () => void;
}

export default function LoginPopup({ show, onClose, onRegisterClick, onContinueAsGuest }: LoginPopupProps) {
  const router = useRouter();

  if (!show) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-scaleIn"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="text-center mb-4">
          <i className="fas fa-user-circle text-5xl text-[#ff3366]"></i>
        </div>
        <h3 className="text-xl font-bold text-[#2c2d5a] mb-3 text-center">Create an Account?</h3>
        <p className="text-gray-600 mb-5 text-center">
          Creating an account lets you track your orders and save your information for faster checkout.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-center">
          <button
            onClick={onRegisterClick}
            className="py-2.5 px-5 bg-[#ff3366] text-white rounded-lg hover:bg-[#e62e5c] transition font-medium flex items-center justify-center whitespace-nowrap cursor-pointer"
          >
            <i className="fas fa-user-plus mr-2"></i> Register
          </button>
          <button
            onClick={onContinueAsGuest}
            className="py-2.5 px-5 border border-gray-300 text-[#2c2d5a] rounded-lg hover:bg-gray-100 transition font-medium flex items-center justify-center whitespace-nowrap cursor-pointer"
          >
            <i className="fas fa-arrow-right mr-2"></i> Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
} 