import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Add this

const quotes = [
  "Good food is the foundation of genuine happiness.",
  "Cooking is love made visible.",
  "First we eat, then we do everything else.",
  "Happiness is homemade.",
  "Let's get this recipe party started!",
];

const Loading = () => {
  const [quote, setQuote] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate(); // <-- Hook for navigation
  const loadingMessage = "Whipping up something tasty for you... 🍰";

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    let i = 0;
    const typingInterval = setInterval(() => {
      setText((prev) => prev + loadingMessage[i]);
      i++;

      if (i >= loadingMessage.length) {
        clearInterval(typingInterval);
        // Wait 1 second then navigate to /login
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200">
      <div className="backdrop-blur-md bg-white/30 p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-md w-full animate-fade-in-down">
        <div className="w-24 h-24 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            className="w-full h-full animate-bounce"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h18M7 10v10a2 2 0 002 2h6a2 2 0 002-2V10m-9-4h6m-3 0v-2m4.5 2h.01M6.5 6h.01"
            />
          </svg>
        </div>
        <p className="text-lg text-white font-medium tracking-wide min-h-[3rem] text-center">
          {text}
        </p>
        <p className="mt-4 text-white text-sm italic text-center animate-pulse">
          "{quote}"
        </p>
      </div>
    </div>
  );
};

export default Loading;
