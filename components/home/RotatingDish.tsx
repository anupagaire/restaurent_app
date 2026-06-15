"use client";

import { useEffect, useState } from "react";

const dishes = [
  "🍜 Best Momo?",
  "🍕 Best Pizza?",
  "🍔 Best Burger?",
  "🥘 Best Thakali Set?",
  "☕ Best Coffee?",
];

export default function RotatingDish() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % dishes.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-accent font-bold">
      {dishes[index]}
    </span>
  );
}