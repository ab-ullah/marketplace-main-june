import { useState, useEffect } from "react";

interface WindowDimentions {
  width: number;
  height: number;
  breakpoint: string;
}

function getWindowDimensions(): WindowDimentions {
  const { innerWidth: width, innerHeight: height } = window;
  const getBreakpoint = () => {
    if (width < 576) return "xs";  // Extra small
    if (width < 768) return "sm";  // Small
    if (width < 992) return "md";  // Medium
    if (width < 1200) return "lg"; // Large
    return "xl"; // Extra large
  };

  return {
    width,
    height,
    breakpoint: getBreakpoint()
  };
}

export default function useWindowDimensions(): WindowDimentions {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimentions>(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize(): void {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);

    return (): void => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
