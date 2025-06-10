import styled from "styled-components";

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
  width: fit-content;
  background-color: ${({ children }: StatusProps) => {
  switch (children) {
    case "pending gp signature":
      return "#ECA106";
    case "completed":
      return "#2E86DE";
    default:
      return "#0f7878";
  }
}};
`;