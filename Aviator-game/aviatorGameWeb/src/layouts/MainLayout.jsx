import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation
import './MainLayout.css'; // Import styles for the layout

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      {/* Header */}
      

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      
    </div>
  );
};

export default MainLayout;
