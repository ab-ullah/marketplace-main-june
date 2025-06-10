import styled from "styled-components";
import {Breadcrumb} from "react-bootstrap";

export const StyledBreadCrumb = styled(Breadcrumb)`
  a {
    text-decoration: none;
    color: #90A4AE;
  }
  
  .active {
    color: #90A4AE;
  }
  
  .breadcrumb-item {
    :before {
      color: #90A4AE;
    }
  }
`