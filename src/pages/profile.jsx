import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/firebaseProfileService";
import { getFamilyNetwork } from "../services/firebaseFamilyService";
import { motion } from "framer-motion";

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      const response = await getUserProfile(currentUser.uid);
      if (response.success) {
        setProfileData(response.data);
      } else {
        setError("Failed to load profile data.");
      }
      setLoadingProfile(false);
    };

    const fetchFamily = async () => {
      setLoadingFamily(true);
      try {
        const members = await getFamilyNetwork(currentUser.uid);
        setFamilyMembers(members || []);
      } catch (error) {
        setError("Failed to load family members.");
        console.error("Error loading family members:", error);
      }
      setLoadingFamily(false);
    };

    fetchProfile();
    fetchFamily();
  }, [currentUser]);

  if (loadingProfile || loadingFamily) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-[60vh] text-lg text-gray-600"
      >
        Loading profile...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-600 text-center p-4 bg-red-100 rounded-md max-w-xl mx-auto"
      >
        {error}
      </motion.div>
    );
  }

  if (!profileData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-600 p-6"
      >
        No profile data found.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-xl border border-gray-200"
    >
      <h1 className="text-5xl font-extrabold mb-10 border-b-4 border-indigo-600 pb-5 text-indigo-700 drop-shadow-md">
        Profile
      </h1>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
        <div className="w-44 h-44 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-indigo-300">
          {profileData.photoURL ? (
            <img
              src={profileData.photoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-xl">No Photo</span>
          )}
        </div>
        <div className="flex-1 text-gray-900">
          <h2 className="text-3xl font-semibold mb-6">{profileData.displayName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 text-lg">
            <div>
              <p>
                <span className="font-semibold">Email:</span> {profileData.email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {profileData.phone || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Age:</span> {profileData.age || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Gender:</span> {profileData.gender || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Blood Group:</span> {profileData.bloodGroup || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Emergency Contact:</span> {profileData.emergencyContact || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {profileData.address || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Medical History:</span> {profileData.medicalHistory || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-4xl font-semibold mt-16 mb-8 border-b-4 border-indigo-600 pb-4 text-indigo-700 drop-shadow-md">
        Family Members
      </h2>
      {familyMembers.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-center"
        >
          No family members found.
        </motion.p>
      ) : (
        <ul className="space-y-6">
          {familyMembers.map((member) => (
            <motion.li
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="border p-6 rounded-xl shadow-md bg-gray-50 hover:bg-indigo-50 transition-colors duration-300"
            >
              <p>
                <span className="font-semibold">Name:</span> {member.name || member.displayName || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Relationship:</span> {member.relationship || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {member.email || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Access Level:</span> {member.accessLevel || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Emergency Contact:</span> {member.isEmergencyContact ? "Yes" : "No"}
              </p>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default Profile;
