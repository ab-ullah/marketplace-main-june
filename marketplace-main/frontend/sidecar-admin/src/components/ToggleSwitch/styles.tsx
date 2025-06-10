import styled from 'styled-components';

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ToggleLabel = styled.span`
  margin-left: 10px;
`;

export const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 41px; 
  min-width: 41px;
  height: 20px;
  min-height: 20px;
`;

export const Slider = styled.span<{checked:boolean,disabled?:boolean}>`
position: absolute;
cursor: pointer;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: ${props => (props.checked ? '#413C69' : '#ccc')};
transition: .4s;
border-radius: 20px;
opacity: ${props => (props.disabled ? '0.5' : '1')};

::before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px; 
  left: 2px; 
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  transform: ${props => (props.checked ? 'translateX(21px)' : 'translateX(0)')}; 
}
`;

export const Input = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;