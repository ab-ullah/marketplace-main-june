import styled from "styled-components";
import BSButton from "react-bootstrap/Button";

export const darkenColor = (colorHex: string, darknessPercent = 0) => {
  if (colorHex === "transparent") return colorHex;

  const darkenValue = 1 - darknessPercent / 100;

  const red = parseInt(colorHex.slice(1, 3), 16);
  const green = parseInt(colorHex.slice(3, 5), 16);
  const blue = parseInt(colorHex.slice(5, 7), 16);

  const darkenedRed = Math.floor(red * darkenValue);
  const darkenedGreen = Math.floor(green * darkenValue);
  const darkenedBlue = Math.floor(blue * darkenValue);

  return `rgb(${darkenedRed}, ${darkenedGreen}, ${darkenedBlue})`;
};

export const ThemeButton = styled(BSButton)`
  background-color: ${(props) =>
    props.var === "outlined"
      ? "transparent"
      : props.background || props.theme.palette.primary} !important;
  color: ${(props) =>
    props.var === "outlined"
      ? props.background || props.theme.palette.primary
      : "white"} !important;
  border-color: ${(props) => props.background || props.theme.palette.primary} !important;
  &:hover {
    background-color:  ${(props) =>
      props.var === "outlined"
        ? "transparent"
        : darkenColor( props.background || props.theme.palette.primary, 25)} !important;
`;
