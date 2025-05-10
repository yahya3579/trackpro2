"use client";

import { useEffect, useState } from "react";

export const TextGenerateEffect = ({ words, className }) => {
  const [wordArray, setWordArray] = useState([]);
  const [completedTyping, setCompletedTyping] = useState(false);

  useEffect(() => {
    // If no words prop is provided, or it's an empty string, return
    if (!words || words.length === 0) {
      return;
    }

    // Initialize an array of empty strings for each character in words
    setWordArray(new Array(words.length).fill(""));

    // Start typing effect
    let currentIndex = 0;
    let currentWordArray = new Array(words.length).fill("");
    
    const typingInterval = setInterval(() => {
      // If we've reached the end of the text, clear the interval
      if (currentIndex === words.length) {
        clearInterval(typingInterval);
        setCompletedTyping(true);
        return;
      }

      // Add the next character
      currentWordArray[currentIndex] = words[currentIndex];
      setWordArray([...currentWordArray]);
      currentIndex++;
    }, 15); // Type at a speed of 15ms per character

    return () => {
      clearInterval(typingInterval);
    };
  }, [words]);

  return (
    <div className={className}>
      {wordArray.map((char, index) => (
        <span
          key={index}
          className={completedTyping ? "" : "opacity-0 animate-fadeIn"}
          style={{ animationDelay: `${index * 15}ms` }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}; 