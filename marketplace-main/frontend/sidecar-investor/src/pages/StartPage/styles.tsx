import styled from "styled-components";

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  flex-direction: row;

  h1 {
    flex-grow: 1;
  }
`

export const StartPageSectionHeading = styled.h4`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 29px;
  color: rgba(2, 2, 3, 0.9);
  margin-bottom: 16px;
`

export const ActiveApplicationsContainer = styled.div`

  .scrollable {
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
  }
`

export const QuestionDiv = styled.div`
  padding: 0 50px 64px 50px;
  background-color: #eceff1;
  display: flex;
`

export const WelcomeBackText = styled.h1`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  color: #020203;
  
  span {
    text-transform: capitalize;
  }
  `