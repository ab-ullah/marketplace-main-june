import styled from "styled-components";

export const FullWidthDiv = styled.div`
  width: 100%;
  text-align: center;
`

export const QuestionsHeading = styled(FullWidthDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 60px;
  color: #020203;
`

export const ContactHeading = styled(FullWidthDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin-top: 22px;
`

export const Email = styled(FullWidthDiv)`
  margin-top: 22px;

  a {
    font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 32px;
    line-height: 38px;
    color: #2E86DE !important;
    text-decoration: none;
  }

`