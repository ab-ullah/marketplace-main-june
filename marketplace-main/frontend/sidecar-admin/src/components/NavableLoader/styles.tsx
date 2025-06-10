import styled, { keyframes } from "styled-components";

const moveLogo = keyframes`
    0% { transform: rotate3d(0, 0, 1, 0deg); }
    30% { transform-origin: center; transform: rotate3d(0, 0, 1, -10deg); }
`

export const Logo = styled.img`
    animation-name: ${moveLogo};
    animation-duration: 1s;
    animation-iteration-count: infinite;
    width: 70px;
`;

export const LoaderContainer = styled.div`
    text-align: center;
`;

export const CenteredLoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;