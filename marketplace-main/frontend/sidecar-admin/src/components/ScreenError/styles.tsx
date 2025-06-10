import styled from "styled-components";

export const Title = styled.h3`
  font-size: 40px;
  font-weight: 700;
  line-height: 60px;
  flex:5;
`;

export const Container = styled.div`
  margin-top: 76px; 
  padding: 16px 80px;
  height: 92vh;
  background: #E5E5E5;
  @media (max-width: 991px) {
    padding: 16px 24px;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 991px){
    padding-top: 24px;
  }
`;