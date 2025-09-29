import React from "react";

const HealthConditions = () => {
  const conditions = [
    "Diabetes Care",
    "Cardiac Care",
    "Stomach Care",
    "Pain Relief",
    "Liver Care",
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-lg font-semibold mb-4">Browse by Health Conditions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {conditions.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-lg shadow-sm p-4 text-center hover:shadow-md transition"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HealthConditions;
