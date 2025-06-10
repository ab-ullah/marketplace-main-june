import React, {FunctionComponent} from 'react';
import {Breadcrumb} from "react-bootstrap";
import styled from "styled-components";


const StyledBreadcrumb = styled(Breadcrumb)`
  z-index: 10;
  position: relative;
  margin-bottom: 30px;

  a {
    text-decoration: none;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 17px;
    color: #2E86DE;
  }

  .active {
    color: #78919C;
  }

  .breadcrumb-item::before {
    color: #78909C;
`

interface BreadCrumbItem {
  name: string;
  href: string | null;
  active: boolean;
}


interface HeaderBreadCrumbsProps {
  items: BreadCrumbItem[];
}


const HeaderBreadCrumbs: FunctionComponent<HeaderBreadCrumbsProps> = ({items}) => {

  return <StyledBreadcrumb>
    {items.map((item) => {
      const props = {} as any;
      if (item.href) props.href = item.href;
      return <Breadcrumb.Item active={item.active} {...props}>{item.name}</Breadcrumb.Item>
    })}
  </StyledBreadcrumb>
};

export default HeaderBreadCrumbs;
