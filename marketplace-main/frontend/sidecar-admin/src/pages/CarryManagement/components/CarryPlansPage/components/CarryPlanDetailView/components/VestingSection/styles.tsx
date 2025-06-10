import styled from "styled-components";

export const MilestoneName = styled.h4`
  font-family: Inter;
  font-size: 18px;
  font-weight: 300;
  line-height: 30px;
  text-align: left;
`;

export const Description = styled.p`
  font-family: Quicksand;
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: 0.15px;
  text-align: left;
`;

export const NoMilestones = styled.div`
  width: 100%;
  height: 211px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  opacity: 0px;
  background: #eceff1;
  justify-content: center;
  p {
    font-family: Quicksand;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: 0.02em;
    text-align: center;
    margin: 0px;
  }
`;

export const VestingPercentageCont = styled.div`
width: 50px;
margin-left:5px;
.form-control {
padding: 0.675rem .75rem !important;
}
`
