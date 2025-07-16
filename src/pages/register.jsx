import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <img
            src="https://e7.pngegg.com/pngimages/261/718/png-clipart-perth-health-fitness-and-wellness-logo-meetup-embracing-miscellaneous-leaf-thumbnail.png"
            alt="Health Logo"
            className="w-16 h-16 mb-2 animate-float"
          />
          <h2 className="text-2xl font-bold text-indigo-700">Create Account</h2>
          <p className="text-gray-500 text-sm">Register for Swasthyakink</p>
        </div>
        <form className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M21.12 15.804A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-1.13 0-2.22.148-3.25.425M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97.488-5.627 1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M21.12 15.804A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-1.13 0-2.22.148-3.25.425M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97.488-5.627 1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-yellow-400 hover:text-indigo-800 transition-colors duration-200 mt-2"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-yellow-500 font-semibold">Login</Link>
        </div>
      </div>
    </main>
  );
};

export default Register; 