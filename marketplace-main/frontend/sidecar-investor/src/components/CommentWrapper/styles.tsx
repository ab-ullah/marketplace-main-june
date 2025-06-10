import { Button } from "react-bootstrap";
import styled from "styled-components";
import { ThemeButton } from "../Button/styles";

export const CommentContainer = styled(({ status, ...props }) => <div {...props} />)`
  background-color: ${({ status }) => status?.backgroundColor};
  border-radius: 8px;
  cursor: ${({ onClick }) => onClick ? 'pointer' : 'default'};
  display: flex;
  flex-direction: column;
  min-height: 67px;
  margin-top: 4px;
  margin-bottom: 4px;
  padding: 8px;
  transition: all 0.3s ease;
  width: 100%;
  white-space: pre-line;
`;

export const CommentBadge = styled(({ status, ...props }) => <div {...props} />)`
  background-color: ${({ status }) => status?.badgeColor};
  border-radius: 27px;
  color: white;
  font-family: 'Quicksand Medium';
  padding: 4px 10px;
  transition: all 0.3s ease;
  user-select: none;
  width: fit-content;
`;

export const RepliesWrapper = styled(({ status, ...props }) => <div {...props} />)`
  margin-top: 16px;
  font-family: 'Quicksand Bold';
 `;

export const Reply = styled.div`
background-color: cornflowerblue;
    padding: 5px 10px;
    border-radius: 10px;
    white-space: break-spaces;
    color: white;
    margin-top: 10px;
  }
    div {
      display: flex;
      justify-content: space-between;
    }
    h5 {
      font-size: 16px;
      color: white;
    }
    p {
      font-size: 14px;
      color: white;
    }
`

export const ReplyButton = styled(ThemeButton)`
  font-size: 14px !important;
  padding: 8px 18px;
  margin-top: 10px;
  float: right;
`