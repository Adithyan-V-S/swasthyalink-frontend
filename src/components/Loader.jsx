import React from "react";

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="w-16 h-16 border-4 border-indigo-400 border-t-yellow-400 rounded-full animate-spin"></div>
  </div>
);

export default Loader; 