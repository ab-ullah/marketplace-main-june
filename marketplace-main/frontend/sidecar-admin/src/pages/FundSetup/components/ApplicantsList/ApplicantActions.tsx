import { FunctionComponent, useState, MouseEvent } from "react";
import Popover from "@material-ui/core/Popover";
import MenuIcon from "@material-ui/icons/MoreVert";
import { Link, MenuIconWrapper } from "./styles";
import {
  APPROVED,
  DENIED,
  WITHDRAWN,
} from "../../../../constants/applicationStatus";


interface IApplicantActions {
  fundDetailsURL: string;
  hideApproval?: boolean;
  toggleModal: () => void;
  handleUpdateSelectedStatus: (status: number) => void,
  toggleWithdrawConfirmationModal: () => void;
}

const ApplicantActions: FunctionComponent<IApplicantActions> = ({
  fundDetailsURL,
  hideApproval,
  toggleModal,
  handleUpdateSelectedStatus,
  toggleWithdrawConfirmationModal
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null);
  
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event && event.currentTarget)
      setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <MenuIconWrapper onClick={handleClick}>
        <MenuIcon />
      </MenuIconWrapper>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Link className="mr-1" to={fundDetailsURL}>
          View
        </Link>
        {!hideApproval && <Link
          className="mr-1"
          to={fundDetailsURL}
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleUpdateSelectedStatus(APPROVED);
            handleClose();
          }}
        >
          Approve
        </Link>}
        <Link
          className="mr-1"
          to={fundDetailsURL}
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleUpdateSelectedStatus(DENIED);
            handleClose();
          }}
        >
          Decline
        </Link>
        <Link
          className="mr-1"
          to={fundDetailsURL}
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            toggleWithdrawConfirmationModal();
            handleClose();
          }}
        >
          Withdraw
        </Link>
        <Link
          className="mr-1"
          to={fundDetailsURL}
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            toggleModal();
            handleClose();
          }}
        >
          Edit
        </Link>

      </Popover>
      
    </div>
  );
};

export default ApplicantActions;
