import React from "react";

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

const PatientDashboard = () => {
  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 flex flex-col items-center">
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
    </main>
  );
};

export default PatientDashboard; 