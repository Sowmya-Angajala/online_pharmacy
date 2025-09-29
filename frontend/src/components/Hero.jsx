import React from "react";

const Hero = () => {
  return (
    <section className="bg-green-900 text-white py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">
          Buy Medicines and Essentials
        </h1>
        <div className="flex items-center bg-white rounded-full px-4 py-2 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search Medicines"
            className="flex-1 outline-none text-gray-700 px-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-full">
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
