import React, { useEffect, useState } from "react";
import "./ColorPickerApp.css";

const ColorPickerApp = () => {
  const colors = ["white", "green", "yellow", "tomato", "red", "black", "violet", "purple"];

  const [color, setColor] = useState(() => {
    const savedColor = window.localStorage.getItem('color');
    return savedColor || "white"; // Provide a default color if no color is saved
  });

  const handleChangeColor = (selectedColor) => {
    setColor(selectedColor);
  };

  useEffect(() => {
    window.localStorage.setItem('color', color);
  }, [color]);

  return (
    <div className="container" style={{ backgroundColor: color }}>
      <h1 className="title">Color App</h1>
      <div className="color-display">
        <div className="selected-color" style={{ backgroundColor: color }}></div>
      </div>
      <ul className="color-list">
        {colors.map((item) => (
          <li key={item} className="color-item">
            <button onClick={() => handleChangeColor(item)} className="color-button" style={{ backgroundColor: item }}>{item}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ColorPickerApp;
