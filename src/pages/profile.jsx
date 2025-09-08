import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/firebaseProfileService";
import { getFamilyNetwork } from "../services/firebaseFamilyService";

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
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!profileData) {
    return <div>No profile data found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-bold mb-8 border-b pb-4">Profile</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
        <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
          {profileData.photoURL ? (
            <img
              src={profileData.photoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-lg">No Photo</span>
          )}
        </div>
        <div className="flex-1 text-gray-800">
          <h2 className="text-2xl font-semibold mb-4">{profileData.displayName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-lg">
            <div>
              <p><span className="font-semibold">Email:</span> {profileData.email}</p>
              <p><span className="font-semibold">Phone:</span> {profileData.phone || "N/A"}</p>
              <p><span className="font-semibold">Age:</span> {profileData.age || "N/A"}</p>
              <p><span className="font-semibold">Gender:</span> {profileData.gender || "N/A"}</p>
            </div>
            <div>
              <p><span className="font-semibold">Blood Group:</span> {profileData.bloodGroup || "N/A"}</p>
              <p><span className="font-semibold">Emergency Contact:</span> {profileData.emergencyContact || "N/A"}</p>
              <p><span className="font-semibold">Address:</span> {profileData.address || "N/A"}</p>
              <p><span className="font-semibold">Medical History:</span> {profileData.medicalHistory || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-semibold mt-12 mb-6 border-b pb-3">Family Members</h2>
      {familyMembers.length === 0 ? (
        <p className="text-gray-600">No family members found.</p>
      ) : (
        <ul className="space-y-4">
          {familyMembers.map((member) => (
            <li key={member.id} className="border p-4 rounded-lg shadow-sm bg-gray-50">
              <p><span className="font-semibold">Name:</span> {member.name || member.displayName || "N/A"}</p>
              <p><span className="font-semibold">Relationship:</span> {member.relationship || "N/A"}</p>
              <p><span className="font-semibold">Email:</span> {member.email || "N/A"}</p>
              <p><span className="font-semibold">Access Level:</span> {member.accessLevel || "N/A"}</p>
              <p><span className="font-semibold">Emergency Contact:</span> {member.isEmergencyContact ? "Yes" : "No"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
