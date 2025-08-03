import React from "react";
import { Link } from "react-router-dom";
import Image from "../components/common/Image";
import { EXTERNAL_IMAGES } from "../constants/images";

const Home = () => {
  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-700 mb-6 drop-shadow-lg">
            Welcome to <span className="text-blue-600">Swasthyalink</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your trusted partner in digital healthcare. Manage your health records, appointments,
            and family access with enterprise-grade security and user-friendly design.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <Link
              to="/about"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold shadow-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center">
          <Image
            src={EXTERNAL_IMAGES.HERO_HEALTHCARE}
            alt="Professional healthcare and wellness image"
            className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 object-cover"
            fallbackSrc={EXTERNAL_IMAGES.HERO_HEALTHCARE}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose Swasthyalink?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 3.657 10.857 8.87 12.574a.75.75 0 00.76 0c5.213-1.717 8.87-6.632 8.87-12.574 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Enterprise-grade security with end-to-end encryption ensures your health data remains private and secure.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Family Access</h3>
              <p className="text-gray-600">
                Control who can access your health records with granular permissions for family members and emergency contacts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18A3 3 0 018.25 21H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Quick Access</h3>
              <p className="text-gray-600">
                QR code-based instant access to your medical records for healthcare providers and emergency situations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
