import React from "react";

const QuickActions = () => {
  const cards = [
    { title: "Pharmacy Near Me", desc: "Find Store" },
    { title: "Get 20%* off on Medicines", desc: "Upload Now" },
    { title: "Doctor Appointment", desc: "Book Now" },
    { title: "Health Insurance", desc: "Explore Plans" },
    { title: "Lab Tests", desc: "At Home" },
  ];

  return (
    <section className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-4 py-8">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition"
        >
          <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
          <p className="text-xs text-gray-500">{card.desc}</p>
        </div>
      ))}
    </section>
  );
};

export default QuickActions;
