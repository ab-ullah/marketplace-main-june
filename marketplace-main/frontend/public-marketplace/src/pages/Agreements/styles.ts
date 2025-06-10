import styled from "styled-components";
import Container from "react-bootstrap/Container";

export const Wrapper = styled.div`
    background-color: #fff;
    border-radius: 4px;
    margin: 0 auto;
    padding: 80px;
    transition: all 0.3s ease;
`

export const THead =styled.thead`
background-color: ${props => props.theme.palette.primary};
color: white;
`

export const MarginBottomContainer = styled(Container)`
  min-height: calc(100vh - 320px);
`

export const FileLink = styled.a`
  cursor:pointer;
  color:blue;
  text-decoration:underline;
`;