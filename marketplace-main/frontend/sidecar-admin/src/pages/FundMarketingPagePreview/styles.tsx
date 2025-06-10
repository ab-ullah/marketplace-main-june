import styled from "styled-components";
import Container from "react-bootstrap/Container";
import leftIcon from "../../assets/images/arrow-left-icon.svg"
import leftIconWhite from "../../assets/images/arrow-left-icon-white.svg"
import leftIcon2 from "../../assets/images/arrow-left-icon2.svg"
import leftIcon2White from "../../assets/images/arrow-left-icon2-white.svg"
import shareIcon from "../../assets/images/share-icon.svg"
import shareIconWhite from "../../assets/images/share-icon-white.svg"

export const PreviewContainer = styled(Container)`
  background: #ffffff;
  min-height: calc(100vh - 84px);
  margin-top: 76px;

  .btn {
    font-family: 'Quicksand Bold';
    border-radius: 40px;


    &.btn-back-to-edit,
    &.btn-back,
    &.btn-share {
      position: relative;

      &:before {
        content: '';
        background-size: cover;
        display: inline-block;
        vertical-align: middle;
        margin-right: 10px;
      }
    }

    &.btn-back-to-edit {
      &:before {
        background-image: url(${leftIcon});
        width: 16px;
        height: 16px;
      }

      &:hover {

        &:before {
          background-image: url(${leftIconWhite});
        }
      }
    }

    &.btn-back {
      color: #AD62AA !important;
      border-color: #AD62AA;

      &:before {
        background-image: url(${leftIcon2});
        width: 16px;
        height: 16px;
      }

      &:hover {
        color: #fff !important;
        background: #AD62AA;
        border-color: #AD62AA;

        &:before {
          background-image: url(${leftIcon2White});
        }
      }
    }

    &.btn-share {
      margin-top: 2px;

      &:before {
        background-image: url(${shareIcon});
        width: 15px;
        height: 17px;
      }

      &:hover {

        &:before {
          background-image: url(${shareIconWhite});
        }
      }
    }
  }
`