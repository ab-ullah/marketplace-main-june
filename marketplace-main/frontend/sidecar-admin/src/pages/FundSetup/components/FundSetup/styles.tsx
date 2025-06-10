import { Button as BootstrapButton } from 'react-bootstrap';
import styled from 'styled-components';

export const Button = styled(BootstrapButton)`
    padding: 10px 30px;
    border: 1px solid #E37628;
    color: #E37628;
    box-sizing: border-box;
    border-radius: 70px;
    font-size: 18px;
    line-height: 22px;
`;

export const H3 = styled.h3`
    font-size: 24px;
    font-weight: 400;
    line-height: 36px;
`;

export const H2 = styled.h2`
    font-size: 18px;
    font-weight: 400;
    line-height: 36px;
`;


export const Subtext = styled.div`
    font-size: 1rem;
    color: #818285;
    font-style: italic;
    font-family: 'Quicksand Medium';
    padding-bottom: 5px;
`;
