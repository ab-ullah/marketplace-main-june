import styled from "styled-components";
import {
  COMMENT_CREATED,
  COMMENT_RESOLVED,
  COMMENT_UPDATED
} from "../../../../constants/commentStatus";
import { PillsWrapper } from "../../../FundSetup/components/ApplicantsList";

export const CommentSection = styled.div`
  &:hover {
    background: #EFEEED;
  }
  
  padding: 16px 24px;
  
  .flag-question-text {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: flex-start;

    .question-text {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 700;
      font-size: 14px;
      line-height: 18px;
    }
  }

  .comment {
    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #020203;
  }

  .date-status {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: flex-start;

    .date-div {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      color: #90A4AE;
    }
  }

`

export const Badge = styled(({ status, ...props }) => <PillsWrapper {...props} />)`
  background-color: ${({ status }) => {
    switch (status) {
      case COMMENT_UPDATED:
        return "#CF7500";
      case COMMENT_CREATED:
        return "#2E86DE";
      case COMMENT_RESOLVED:
        return "#10AC84";
      default:
        return "transparent";
    }
  }};
`;

export const CommentHeader = styled.div`
  align-content: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  .question-text{
    align-self: center;
  }
`;

export const Resolve = styled.div`
  align-items: center;
  color: #F42222;
  cursor: pointer;
  display: flex;
  font-size: 16px;
  padding-left: 8px;
  transition: all 0.2s ease-in-out;
  &:hover {
    color: #ff0000;
    .MuiSvgIcon-root{
      fill: #ff0000;
    }
  }
  .MuiSvgIcon-root{
    fill: #F42222;
    width: 20px;
    transition: all 0.2s ease-in-out;
  }
`;