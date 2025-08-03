import React from "react";

const policies = [
  {
    title: "Ayushman Bharat Yojana",
    description:
      "A flagship scheme aimed at providing health coverage to over 50 crore Indians, offering free treatment up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    link: "https://pmjay.gov.in/",
  },
  {
    title: "National Health Mission (NHM)",
    description:
      "NHM focuses on strengthening health systems, improving maternal and child health, and controlling communicable and non-communicable diseases across India.",
    link: "https://nhm.gov.in/",
  },
  {
    title: "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
    description:
      "Aims to provide assured, comprehensive, and quality antenatal care, free of cost, universally to all pregnant women on the 9th of every month.",
    link: "https://pmsma.nhp.gov.in/",
  },
  {
    title: "Mission Indradhanush",
    description:
      "An immunization initiative to ensure full vaccination for all children under the age of two and pregnant women against seven vaccine-preventable diseases.",
    link: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=824&lid=220",
  },
];

const About = () => {
  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-10 flex flex-col items-center">
      <section className="max-w-3xl w-full text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4">About Swasthyalink</h2>
        <p className="text-lg text-gray-700 mb-6">
          Swasthyalink is dedicated to empowering individuals with accessible healthcare information and digital tools. We believe in supporting the vision of a healthy India by aligning with key government health initiatives.
        </p>
      </section>
      <section className="max-w-4xl w-full">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">Key Indian Government Health Policies</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {policies.map((policy) => (
            <div key={policy.title} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-400 hover:border-yellow-400 transition-all duration-200 transform hover:scale-105">
              <h4 className="text-xl font-bold text-indigo-700 mb-2">{policy.title}</h4>
              <p className="text-gray-700 mb-3">{policy.description}</p>
              <a
                href={policy.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-yellow-500 font-semibold underline"
              >
                Learn More
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default About;
