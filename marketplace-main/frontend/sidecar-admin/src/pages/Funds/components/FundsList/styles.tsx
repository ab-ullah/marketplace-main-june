import TH from "@material-ui/core/TableHead";
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";
import styled from "styled-components";
import { Link } from "react-router-dom";
export const TableHead = styled(TH)`
  background-color: #413c69;
  .MuiTableCell-head {
    color: white;
  }
`;

export const ThreeDots = styled(MoreVertOutlinedIcon)`
  fill: #b0bec5 !important;
  cursor: pointer;
`;

export const ActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: no-wrap;
`;

export const FundId: any = styled(Link)`
  color: #020203;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px dotted #666;
`;

export const StatusDateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
`;
export const DateContainer = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #90a4ae;
  text-align: center;
`;

export interface StatusProps {
  status: string;
  children: string;
}

export const Status: any = styled.div`
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 2em;
  text-transform: capitalize;
  background-color: ${({ children }: StatusProps) => {
    switch (children) {
      case "Live on Portal":
        return "#ECA106";
      case "Accepting Applications":
        return "#2E86DE";
      case "Applicant Review":
        return "#9C1D1D";
      default:
        return "#B0BEC5";
    }
  }};
`;

export const FinalizeContainer = styled(StatusDateContainer)`
  cursor: pointer;
`;

export const FinalizeStatus = styled(Status)`
  background-color: ${({canBeFinalized}) => canBeFinalized ? `#2E86DE` : `#B0BEC5`};
`;


export const FundAnalyticsContainer = styled(StatusDateContainer)`
  display: inline-flex;
  margin-left: 4px;
  > div {
    background-color: #AA0000;
  }
`;
