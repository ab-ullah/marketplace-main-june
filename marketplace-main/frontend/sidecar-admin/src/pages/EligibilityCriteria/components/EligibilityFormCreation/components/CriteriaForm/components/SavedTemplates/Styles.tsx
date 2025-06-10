import styled from "styled-components";
import { Link } from "../../../../../../../FundSetup/components/ApplicantsList/styles";
import { Modal } from "react-bootstrap";

export const BlocksWrapper = styled.div`
  max-height: calc(100vh - 412px);
  overflow: auto;
`;

export const BlocksListWrapper = styled.div`
    display: flex;
    width: 100%;
`

export const FooterWrapper = styled.div`
    padding-top: 2rem;
    border-top: 1px solid #F4F5F6;
    > button {
        float: right
    }
`

export const BlockContainerDiv = styled.div`

  .add-block-card {
    cursor: pointer;
    background: #EBF3FB;
    border-radius: 4px;
    padding: 16px;
    width: calc(32% - 20px);
    margin-right: 20px;

    img {
      margin: 5px 5px 20px 5px;
    }

    p {
      margin: 0;
      font-size: 16px;
      font-family: 'Quicksand Bold';
    }

    span {
      font-size: 14px;
    }

    &.bg-gray {

      background: #EFEEED;
    }

    &.dark-blue {
      background: #2E86DE;

      p {
        color: #ffffff !important;
      }
    }
  }
  .line-clamp1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .d-flex {
    display: flex;
    justify-content: space-between;
  }
  .w-100 {
    width: 100%;
  }
`

export const AppLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 150px;
  color: #444 !important;
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  border-bottom: 1px solid #BAC4C9;
  &.disabled {
    color: #aaa !important;
    cursor: not-allowed;
  }
`;
