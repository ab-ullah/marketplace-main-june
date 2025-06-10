import styled from 'styled-components';
import { ProgressBar as BSProgressBar } from 'react-bootstrap';

export const BarWrapper = styled.div`
  background-color: transparent;
  height: 4px;
  width: 100%;
  position: absolute;
  bottom: 0;
  z-index: 3;
`;

export const ProgressBar = styled(BSProgressBar)`
  background-color: transparent;
  height: 4px;
  .progress-bar {
    background-color: #2E86DE;
  }
`;
