import styled from "styled-components";

export const InfoTile = styled.div`
  background: #f8f9fa;
  border: 1px solid #e2e6eb;
  padding: 24px;
  border-radius: 12px;
  gap: 80px;
  margin-bottom: 36px;

  .infotile-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .subinfotile {
    position: relative;
    padding: 10px;
    margin-bottom: 10px;
  }

  .subinfotile:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px; /* Adjust the height of the line */
    background-color: #ccc; /* Adjust the color of the line */
    margin-left: 10px; /* Adjust the gap on the left side */
    margin-right: 10px; /* Adjust the gap on the right side */
  }
`;

export const InfoValue = styled.h2`
  font-family: Inter;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
`;

export const ClickableInfoValue = styled(InfoValue)`
  &:hover {
    text-decoration: underline;
  }
`;


export const InfoTitle = styled.p`
  font-family: Inter;
  font-size: 20px;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
  color: #607d8b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SubText = styled.p`
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
  color: #607d8b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
