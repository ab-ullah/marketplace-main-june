import styled from "styled-components";
import Container from "react-bootstrap/Container";
import leftIcon from "../../assets/images/arrow-left-icon.svg"
import leftIconWhite from "../../assets/images/arrow-left-icon-white.svg"
import leftIcon2 from "../../assets/images/arrow-left-icon2.svg"
import leftIcon2White from "../../assets/images/arrow-left-icon2-white.svg"
import shareIcon from "../../assets/images/share-icon.svg"
import shareIconWhite from "../../assets/images/share-icon-white.svg"
import goToIcon from "../../assets/images/go-to-icon.svg"


export const PreviewContainer = styled(Container)<{ reviewMode: boolean }>`
  background: #ECEFF1;
  min-height: calc(100vh - 84px);
  margin-top: ${props => props.reviewMode ? 0 : '76px'};
  padding-top: 20px;
  text-align: center;

  .custom-radio-buttons {
    .form-check {
      background: #EBF3FB;
      border-radius: 4px;
      padding: 10px 10px 10px 32px;
      min-width: 140px;
    }
  }

  .document-container {
    border: 1px solid #470C75;
    box-sizing: border-box;
    border-radius: 70px;
    padding: 8px 18px 8px 15px;
    background: transparent;
    color: #470C75;
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 20px;
    position: relative;
    margin-left: 0;

    &:before {
      background-image: url(${goToIcon});
      width: 16px;
      height: 16px;
      content: '';
      background-size: cover;
      display: inline-block;
      vertical-align: middle;
      margin-right: 10px;
    }

    &:hover {
      background: transparent;
      color: #470C75;
    }

  }

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

export const ActiveBlockContainer = styled.div<{ reviewMode: boolean | undefined, flowMode?: boolean | undefined }>`
  background: #fff;
  border-radius: 4px;
  max-width: 984px;
  margin: ${props => props.reviewMode ? `0 auto 24px` : '60px auto 24px'};
  padding: ${props => props.flowMode ? `10px` : '62px 126px;'};
  text-align: left;

  .preview-card-title {
    font-size: 40px;
    font-family: 'Inter';
    font-weight: 700;
  }

  p {
    margin: 30px 0 35px;
  }

  .btn {

    &.btn-lg {
      margin: 0;
      font-size: 24px;
      padding: 12px 27px;
    }
  }
`

export const PageHeader = styled.div`
  background: #fff;
  padding: 15px ${props => props.theme.palette.eligibilityTheme.contentPadLg};
  position: relative;
  z-index: 3;
  overflow: auto;
`

export const PreviewCardImage = styled.img`
  margin: auto;
`

export const AgreeDocumentBlock = styled.div`
  display: flex;
  align-items: center;
  .question-flag {
    margin-left: 8px;
  }
  .file-tag {
    
  }
`
