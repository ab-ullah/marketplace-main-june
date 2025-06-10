import { FunctionComponent } from 'react';
import { COMMENT_UPDATED } from "../../../constants/commentStatus";
import { COMMENT_STATUSES } from '../../../components/CommentWrapper/constants';
import {
  Flag,
  SidebarBadge,
  CommentBadge
} from "../styles";
import { replace, toLower } from 'lodash';

interface CommentCountProps {
  count: number;
  getCommentCountData?: any
  title: string
}

const getSectionId = (label: string) => {
  return toLower(replace(label, /\s/g, "_"));
}

const CommentCount: FunctionComponent<CommentCountProps> = ({ count,title }) => {

const handleScroll=(e:any)=>{
  e.stopPropagation()
  const section = document.getElementById(getSectionId(title))
  const classElements = section?.getElementsByClassName("comment-wrapper")
  classElements?.[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

  if (count === -1)
    return (
      <SidebarBadge color={COMMENT_STATUSES[COMMENT_UPDATED].badgeColor}>
        Updated
      </SidebarBadge>
    );

  return (<>
    {count > 0 && (
      <SidebarBadge onClick={handleScroll}>
        <Flag /> {count} New Requests
      </SidebarBadge>
    )}
  </>)

}

export default CommentCount;