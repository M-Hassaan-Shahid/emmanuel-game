import React, { useEffect, useState } from "react";
import "./../assets/styles/Welcome.css"; // Add any styles for the welcome screen
import bg from "../assets/images/welcome/bg.png";
const Welcome = ({ onWelcomeEnd }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 100 : prevProgress + 20
      );
    }, 150); // Progress increases every 150ms (much faster)

    return () => clearInterval(interval); // Clean up the interval
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      onWelcomeEnd(); // Call the callback to navigate to Home when done
    }
  }, [progress, onWelcomeEnd]);

  return (
    <div className="welcome-screen grid">
      <img src={bg} alt="..." className="w-screen h-screen" />
      <div className="progress-bar absolute">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default Welcome;
