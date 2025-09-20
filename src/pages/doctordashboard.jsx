import React, { useState, useEffect } from "react";

const DoctorDashboard = () => {
  const [profile, setProfile] = useState({
    name: "",
    specialization: "",
    license: "",
    experience: "",
    description: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [connectionMethod, setConnectionMethod] = useState("qr"); // qr, otp, email
  const [connectionValue, setConnectionValue] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    // TODO: Fetch doctor profile from backend
    // Simulated fetch
    setProfile({
      name: "Dr. John Smith",
      specialization: "Cardiology",
      license: "LIC123456",
      experience: "10 years",
      description: "Experienced cardiologist",
      phone: "+1234567890",
    });

    // TODO: Fetch patients list
    setPatients([
      { id: 1, name: "Patient One", email: "patient1@example.com" },
      { id: 2, name: "Patient Two", email: "patient2@example.com" },
    ]);
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    // TODO: Save profile to backend
    setEditing(false);
    setNotification("Profile saved successfully.");
  };

  const sendPrescription = (patient) => {
    // TODO: Send prescription to patient and notify
    const patientPrescription = prescriptions[patient.id] || "";
    if (!patientPrescription.trim()) {
      setNotification("Please write a prescription before sending.");
      return;
    }
    setNotification(`Prescription sent to ${patient.name}`);
    setPrescriptions({ ...prescriptions, [patient.id]: "" });
  };

  const connectPatient = () => {
    // TODO: Implement connection logic based on connectionMethod and connectionValue
    setNotification(`Connection request sent via ${connectionMethod}`);
    setConnectionValue("");
  };

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="mb-6 w-full">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">Doctor Dashboard</h2>
          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Name"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="specialization"
                value={profile.specialization}
                onChange={handleProfileChange}
                placeholder="Specialization"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="license"
                value={profile.license}
                onChange={handleProfileChange}
                placeholder="License"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="experience"
                value={profile.experience}
                onChange={handleProfileChange}
                placeholder="Experience"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <textarea
                name="description"
                value={profile.description}
                onChange={handleProfileChange}
                placeholder="Description"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Phone"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="flex space-x-4">
                <button
                  onClick={saveProfile}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Specialization:</strong> {profile.specialization}</p>
              <p><strong>License:</strong> {profile.license}</p>
              <p><strong>Experience:</strong> {profile.experience}</p>
              <p><strong>Description:</strong> {profile.description}</p>
              <p><strong>Phone:</strong> {profile.phone}</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="w-full mt-8">
          <h3 className="text-2xl font-semibold mb-4">Patients</h3>
          {patients.length === 0 ? (
            <p>No patients connected yet.</p>
          ) : (
            <ul className="space-y-4">
              {patients.map((patient) => (
                <li key={patient.id} className="border border-gray-300 rounded p-4 flex justify-between items-center">
                  <div>
                    <p><strong>{patient.name}</strong></p>
                    <p>{patient.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <textarea
                      placeholder="Write prescription..."
                      value={prescriptions[patient.id] || ""}
                      onChange={(e) => setPrescriptions({ ...prescriptions, [patient.id]: e.target.value })}
                      className="border border-gray-300 rounded p-2 w-64"
                    />
                    <button
                      onClick={() => sendPrescription(patient)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Send
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full mt-8">
          <h3 className="text-2xl font-semibold mb-4">Connect with Patients</h3>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setConnectionMethod("qr")}
              className={`px-4 py-2 rounded ${connectionMethod === "qr" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              QR Code
            </button>
            <button
              onClick={() => setConnectionMethod("otp")}
              className={`px-4 py-2 rounded ${connectionMethod === "otp" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              OTP
            </button>
            <button
              onClick={() => setConnectionMethod("email")}
              className={`px-4 py-2 rounded ${connectionMethod === "email" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Email Invitation
            </button>
          </div>
          <input
            type="text"
            placeholder={
              connectionMethod === "qr"
                ? "Scan QR code (simulate)"
                : connectionMethod === "otp"
                ? "Enter OTP"
                : "Enter patient email"
            }
            value={connectionValue}
            onChange={(e) => setConnectionValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={connectPatient}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Connect
          </button>
        </div>

        {notification && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded">
            {notification}
            <button onClick={() => setNotification("")} className="ml-4 font-bold">X</button>
          </div>
        )}
      </div>
    </main>
  );
};

export default DoctorDashboard;
