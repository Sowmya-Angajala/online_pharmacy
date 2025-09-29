import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Define role-based cards
  const patientCards = [
    {
      title: "Upload Prescription",
      description: "Easily upload your medical prescriptions for review.",
      path: "/upload-prescription",
    },
    {
      title: "My Requests",
      description: "Track the status of your prescription requests.",
      path: "/my-requests",
    },
    {
      title: "Cart",
      description: "View medicines added to your shopping cart.",
      path: "/cart",
    },
    {
      title: "Orders",
      description: "Check your order history and track deliveries.",
      path: "/orders",
    },
  ];

  const pharmacistCards = [
    {
      title: "Pharmacist Dashboard",
      description: "Manage prescriptions, verify requests, and serve patients.",
      path: "/pharmacist-dashboard",
    },
  ];

  const adminCards = [
    {
      title: "Admin Dashboard",
      description: "Manage users, medicines, and system-wide operations.",
      path: "/admin/dashboard",
    },
  ];

  // Select cards based on role
  let cards = [];
  if (user?.role === "patient") cards = patientCards;
  if (user?.role === "pharmacist") cards = pharmacistCards;
  if (user?.role === "admin") cards = adminCards;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {user?.name}!</h1>
      <p className="dashboard-role">Role: {user?.role}</p>

      <div className="card-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
          >
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
