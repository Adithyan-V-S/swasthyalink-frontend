import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { auth } from "../firebaseConfig";

const records = [
  {
    date: "2024-05-01",
    doctor: "Dr. A. Sharma",
    diagnosis: "Hypertension",
    prescription: "Amlodipine 5mg",
    notes: "Monitor BP daily. Next visit in 1 month."
  },
  {
    date: "2024-03-15",
    doctor: "Dr. R. Singh",
    diagnosis: "Type 2 Diabetes",
    prescription: "Metformin 500mg",
    notes: "Maintain diet. Exercise regularly."
  },
  {
    date: "2023-12-10",
    doctor: "Dr. P. Verma",
    diagnosis: "Seasonal Flu",
    prescription: "Rest, Paracetamol",
    notes: "Recovered. No complications."
  },
];

const sidebarLinks = [
  { label: "Dashboard", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
    ) },
  { label: "My Records", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ) },
  { label: "Appointments", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ) },
  { label: "Prescriptions", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-6a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
    ) },
  { label: "Doctors", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-7m0 0l-9-5m9 5l9-5" /></svg>
    ) },
  { label: "Settings", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
    ) },
  { label: "Logout", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
    ) },
];

const PatientDashboard = () => {
  const [uid, setUid] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const qrValue = uid ? `https://yourapp.com/patient/${uid}` : "";

  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 flex flex-row items-start">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 h-full bg-white/90 rounded-2xl shadow-xl mr-8 p-6 gap-2 sticky top-10 z-10">
        <div className="text-2xl font-bold text-indigo-700 mb-6 text-center">Menu</div>
        {sidebarLinks.map((link, idx) => (
          <button key={idx} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-100 text-indigo-700 font-medium transition-colors">
            {link.icon}
            <span>{link.label}</span>
          </button>
        ))}
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">My Patient QR Code</h2>
          {uid && (
            <>
              <QRCode value={qrValue} size={140} className="mb-2" />
              <div className="text-xs text-gray-500 break-all mt-2">UID: {uid}</div>
              <div className="text-xs text-gray-400 break-all">{qrValue}</div>
            </>
          )}
          {!uid && <div className="text-gray-400">Loading QR code...</div>}
        </section>
        <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">My Medical Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="px-4 py-2 text-left text-indigo-700">Date</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Doctor</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Diagnosis</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Prescription</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-4 py-2 border-b">{rec.date}</td>
                    <td className="px-4 py-2 border-b">{rec.doctor}</td>
                    <td className="px-4 py-2 border-b">{rec.diagnosis}</td>
                    <td className="px-4 py-2 border-b">{rec.prescription}</td>
                    <td className="px-4 py-2 border-b">{rec.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PatientDashboard; 