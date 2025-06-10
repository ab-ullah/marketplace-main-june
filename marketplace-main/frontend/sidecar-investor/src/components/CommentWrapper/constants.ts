import {
  COMMENT_CREATED,
  COMMENT_UPDATED,
  COMMENT_RESOLVED
} from "../../constants/commentStatus";
import { CommentStatusesById } from "./interfaces";

export const COMMENT_CREATED_STATUS = 'CREATED';

export const COMMENT_UPDATED_STATUS = 'UPDATED';

export const COMMENT_RESOLVED_STATUS = 'RESOLVED';

export const COMMENT_STATUSES: CommentStatusesById = {
  [COMMENT_CREATED]: {
    code: COMMENT_CREATED_STATUS,
    label: 'New request',
    badgeColor: "#E37628",
    backgroundColor: "#FCF1EA"
  },
  [COMMENT_UPDATED]: {
    code: COMMENT_UPDATED_STATUS,
    label: 'Updated',
    badgeColor: "#2E86DE",
    backgroundColor: "#d3e5f7"
  },
  [COMMENT_RESOLVED]: {
    code: COMMENT_RESOLVED_STATUS,
    label: 'Resolved',
    badgeColor: "#10AC84",
    backgroundColor: "#e6f7e6"
  }
};