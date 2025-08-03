import React from 'react';

const LoadingSpinner = ({ size = "md", color = "indigo" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const colorClasses = {
    indigo: "border-indigo-500",
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    white: "border-white"
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;
