import React from "react";

const ColorPickerApp = () => {
  const colors = ["white", "green", "yellow", "tomato"];

  const[color, setColor] = UseState('white')

  const handleChangeColor = (color) => {
console.log(color);
  }

  return (
    <div>
      <h1>Color App</h1>
      <ul>
        {colors.map((item) => (
          <li key={item}>
            <button>{item}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ColorPickerApp; 
