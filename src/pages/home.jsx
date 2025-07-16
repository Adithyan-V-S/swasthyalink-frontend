import React from "react";

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <section className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4 drop-shadow-lg">
          Welcome to Swasthyakink
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Your trusted partner in digital healthcare. Manage your health, appointments, and records with ease and security.
        </p>
        <a
          href="#register"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-yellow-400 hover:text-indigo-800 transition-colors duration-200"
        >
          Get Started
        </a>
      </section>
      <div className="mt-12 flex justify-center">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWe6tYtj2hCR0_MokAqO1NNpyH3qmCx-jtLw&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWe6tYtj2hCR0_MokAqO1NNpyH3qmCx-jtLw&s"
          alt="Healthcare Illustration"
          className="w-40 h-40 md:w-56 md:h-56 animate-float drop-shadow-xl"
        />
      </div>
    </main>
  );
};

export default Home;
