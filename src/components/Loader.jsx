import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center animate-fade-in-scale">
        <div className="relative mb-6">
          {/* Main spinner */}
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          {/* Counter-rotating spinner */}
          <div
            className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin mx-auto"
            style={{
              animationDirection: 'reverse',
              animationDuration: '1.5s'
            }}
          ></div>
          {/* Pulse effect */}
          <div className="absolute inset-0 w-20 h-20 border-2 border-indigo-300 rounded-full animate-ping mx-auto opacity-20"></div>
        </div>

        {/* Brand name with gradient text */}
        <h2 className="text-3xl font-bold mb-3 gradient-text text-shadow-lg">
          Swasthyalink
        </h2>

        {/* Loading message */}
        <p className="text-indigo-600 font-medium animate-pulse text-lg">
          Loading your healthcare dashboard...
        </p>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;