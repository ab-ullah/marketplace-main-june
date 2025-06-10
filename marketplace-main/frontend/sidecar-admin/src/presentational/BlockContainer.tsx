import styled from "styled-components";

export const BlockContainerDiv = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;

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
  .d-flex {
    display: flex;
    justify-content: space-between;
  }
  .w-100 {
    width: 100%;
  }
`
