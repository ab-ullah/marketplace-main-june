import React, {FunctionComponent} from 'react';
import StyledBadge from "../../../../presentational/StyledBadge";


const UnReadTag: FunctionComponent = () => {
  return <StyledBadge pill bg={'danger'}>Unread</StyledBadge>
};

export default UnReadTag;
