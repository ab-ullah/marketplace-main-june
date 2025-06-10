import styled from "styled-components";
import {TextareaAutosize} from "@material-ui/core";
import Button from "react-bootstrap/Button";

export const CommentHeading = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  margin-bottom: 20px;
`

export const CommentDateTime = styled.span`
  position: absolute;
  right: 10px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #90A4AE;
`

export const CommentAuthor = styled.span`
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 8px;
`

export const CommentText = styled.div`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
`

export const CommentContainer = styled.div`
    padding: 32px;
    position: relative;
    top: 50px;
`

export const CommentTextArea = styled(TextareaAutosize)`
  background: #FFFFFF;
  border: 1px solid #D5CBCB;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
`

export const TextAreaDiv = styled.div`
  padding-top: 24px;
  border-top: 1px #ECEFF1 solid;
  .multiLine {
    min-height: 150px;
    textarea {
      min-height: 150px;
      border-radius: 8px;
      border: 1px solid #D5CBCB;
    }
    .mention {
      background-color: #EFEEED;
      color:  #EFEEED;
    }
    .textArea__suggestions__list {
      border-radius: 8px;
      border: 1px solid #D5CBCB !important;
      .textArea__suggestions__item{
        padding: 4px 8px !important;
      }
      .textArea__suggestions__item--focused {
        background-color: #EFEEED;
      }
    }
    .control {
      fontFamily: 'monospace';
      minHeight: 63px;
    }
    .highlighter {
      padding: 9px;
      border: 1px solid transparent;
    }
    input {
      padding: 9px;
      border: 1px solid silver;
    }
  },
`

export const AddCommentButton = styled(Button)`
  width: 100%;
  text-align: center;
  margin-left: 0 !important;
  margin-top: 20px;
`

export const CommentsListContainer = styled.div`
  max-height: 600px;
  overflow: auto;
`

export const HistoryContainer = styled.div`
  max-height: 600px;
  overflow: auto;
  border-top: 1px #ECEFF1 solid;
  padding-top: 15px;

  font-weight: bold;
`

export const HistoryDateTime = styled.span`
  position: absolute;
  left: 32px;
  padding-top: 6px;
  margin-bottom: 10px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #90A4AE;
`

export const Approver = styled.span`
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 8px;
`


export const CommentAuthorTime = styled.div`
  position: relative;
`