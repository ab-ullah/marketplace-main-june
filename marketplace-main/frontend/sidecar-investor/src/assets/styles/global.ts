import { createGlobalStyle } from "styled-components";
import leftIcon from "../images/arrow-left-icon.svg"
import leftIconWhite from "../images/arrow-left-icon-white.svg"
import leftIcon2 from "../images/arrow-left-icon2.svg"
import leftIcon2White from "../images/arrow-left-icon2-white.svg"
import shareIcon from "../images/share-icon.svg"
import shareIconWhite from "../images/share-icon-white.svg"

export default createGlobalStyle`
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
    &.btn-purple {
      color: #AD62AA !important;
      border-color: #AD62AA;

      &:before {
        width: 16px;
        height: 16px;
      }

      &:hover {
        color: #fff !important;
        background: #AD62AA;
        border-color: #AD62AA;
      }
    }
  }
`;
