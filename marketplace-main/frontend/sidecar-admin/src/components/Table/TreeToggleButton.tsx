import { useState } from "react";

const TreeToggleButton = () => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const icon = expanded ? "collapse" : "expand";

  return (
    <span onClick={handleToggle}>
      <img src={`/assets/images/${icon}.svg`} alt="" />
    </span>
  );
};

export default TreeToggleButton;
