import styled from "styled-components";
import Col from "react-bootstrap/Col";

import Badge from "react-bootstrap/Badge";


export const BannerCol = styled(Col)<{ bgImage: string }>`
  background-image: url(${({ bgImage }) => bgImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px 56px;

  &:after {
    background: linear-gradient(100.86deg, #ECEFF1 58.19%, rgba(236, 239, 241, 0.47) 99.37%);
    content: ' ';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
`

export const BaseDiv = styled.div`
  width: 70%;
  text-align: left;
  z-index: 10;
`

export const FundNameDiv = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 60px;
  color: #020203;
  margin-top: 40px;
  z-index: 10;
`

export const IntroDiv = styled(BaseDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin-top: 28px;
`

export const DescriptionDiv = styled(BaseDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 24px;
  color: #020203;
  margin-top: 24px;
`

export const WhiteBgBadge = styled(Badge)`
  background: #FFFFFF !important;
  position: relative;
  z-index: 10;
  border-radius: 10px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 12px;
  color: #020203;
  width: fit-content;
  margin-right: 10px;
`

export const BadgeParentDiv = styled.div`
  margin-top: 30px;
`
