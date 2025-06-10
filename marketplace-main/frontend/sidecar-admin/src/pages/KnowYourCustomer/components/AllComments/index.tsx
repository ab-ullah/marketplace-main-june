import {FunctionComponent} from 'react';
import orderBy from "lodash/orderBy";
import map from "lodash/map";
import {useAppSelector} from "../../../../app/hooks";
import {selectKYCState} from "../../selectors";
import CommentRow from "./CommentRow";
import moment from "moment";

interface RecordProps {
}

const AllComments: FunctionComponent<RecordProps> = () => {
  const {comments} = useAppSelector(selectKYCState);
  const sortedComments = orderBy(comments, [(comment) => moment(comment.created_at)], ['desc']);
  return <>
    {map(sortedComments, comment => <CommentRow comment={comment} key={comment.id}/>)}

  </>
}

export default AllComments;