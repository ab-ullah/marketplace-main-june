import styled from 'styled-components';
import { Section } from '../../styles';

export const Container = styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    max-width: 432px;
    border-radius: 50%;
    max-height: 432px;
    margin-bottom: 37px;
    order: 1;
    .recharts-wrapper{
        border-radius: 50%;
        background-color: white;
    }
    margin-right: 20px;
    @media (max-width: 1673px){
    }
    @media (max-width: 566px) {
        margin-bottom: 12px;
        .recharts-responsive-container{
            margin: 0px auto;
        }
    }
`;

export const PieChartInsideContent = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h1{
        font-size: 40px;
        font-weight: 700;
        text-align: center;
    }
`;


export const PieReferencesContainer = styled(Section)`
    justify-content: flex-start;
    order: 3;
    @media (max-width: 1619px){
        order: 2;
    }
`;


export const PieReferenceContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-right: 24px;
    padding-bottom: 12px;
    h4{
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
    }
`;


export const PieReferenceDot = styled.div`
    background-color: ${props => props.color};
    border-radius: 50%;
    height: 25px;
    margin-right: 15px;
    width:25px; 
`;