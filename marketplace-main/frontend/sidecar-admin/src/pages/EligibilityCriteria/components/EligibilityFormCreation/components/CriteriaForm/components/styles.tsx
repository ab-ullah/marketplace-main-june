import styled from "styled-components";

export const FormBlockContainerDiv = styled.div`
  background: #FFFFFF;
  margin: 24px;
  padding: 24px;
`

export const DocumentList = styled.li`
  display: flex;
  
  img {
    margin-left: 10px;
    margin-right: 10px;
    cursor: pointer;
  }

`

export const MissingInfoText = styled.p`
  color: #b91c1c !important;
  font-size: 14px;
  margin: 5px 0 5px 0 !important;
`

export const FormInfoText = styled.div`
  background: #EBF3FB !important;
  border-color: #ddebf9 !important;
  p {
    margin: 0 0 16px 0 !important;
    font-size: 14px;
  }
`

export const ConnectorWrapper = styled.div`
  display: flex;
  justify-content: center;
  > div {
    min-width: 120px;
  }
`