import styled from "styled-components";
import Container from "react-bootstrap/Container";

export const TasksPageContainer = styled(Container)`
  background: #ffffff;
  min-height: calc(100vh - 860px);
  margin-top: 76px;

  h4 {
    font-family: Inter;
    font-style: normal;
    font-weight: bold;
    font-size: 40px;
    line-height: 60px;
    margin-left: 54px;
    margin-top: 50px;
    margin-bottom: 40px;
  }
  
  table {
    td {
      font-weight: 700;
    }
  }
  
  .task-type-heading {
    font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 32px;
    line-height: 38px;
    margin-top: 37px;
    margin-bottom: 37px;
  }
  
  div.table-container {
    padding: 37px 56px 0 37px;
    min-height: calc(100vh - 100px);
  }
  div.table-striped tbody tr.task-row:nth-child(even) {
    background-color: #f5f7f8; /* Set the background color for even rows */
  }

  div.table-striped tbody tr.task-row:nth-child(odd) {
    background-color: #ffffff; /* Set the background color for odd rows */
  }

  div.table-striped tbody tr.task-row td {
    background-color: inherit; /* Set the background color for even rows */
  }

  div.table-striped tbody tr.task-row {
    height: 100px;
  }
  
  div.task-container {
    position: relative;
    padding-top: 25px;
    background: linear-gradient(to bottom, #dadada, #e5e5e5) ;
  }
  
  div.task-container thead {
    font-size: 16px;
  }

  div.contained {
    padding: 37px 56px 0 37px;
  }
  
  div.table-responsive {
    min-height: 250px;
  }
`