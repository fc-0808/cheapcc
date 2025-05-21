'use client';
import React from 'react';

const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ name, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    return (
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={name === 'password' ? 'new-password' : undefined}
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10"
          required
          ref={ref}
          {...props}
        />
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff3366] focus:outline-none p-0 m-0"
          tabIndex={0}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? (
            // Open eye icon (Heroicons Eye)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            // Closed eye icon (Heroicons Eye Slash)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 7.5 9.75 7.5c2.042 0 3.82-.375 5.282-.98M6.228 6.228A10.477 10.477 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a10.477 10.477 0 01-1.477 2.276M15.75 12a3.75 3.75 0 01-5.25 3.445M3 3l18 18" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;