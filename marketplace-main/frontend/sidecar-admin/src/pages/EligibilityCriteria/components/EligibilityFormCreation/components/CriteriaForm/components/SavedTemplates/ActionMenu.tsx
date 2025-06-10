import React, { useState } from 'react';
import MenuIcon from "@material-ui/icons/MoreVert";
import Popover from "@material-ui/core/Popover";
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import EditIcon from "@material-ui/icons/Edit";
import { AppLink } from './Styles';
import { MenuIconWrapper } from '../../../../../../../FundSetup/components/ApplicantsList/styles';


const TemplateActionMenu = (props: { onEditTemplate: () => void; onDeleteTemplate: () => void }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return <div>
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
        <AppLink
        to="/"
        onClick={(e: any) => {
          e.preventDefault();
          props.onEditTemplate();
          handleClose()
        }}
        >
        <EditIcon />
          Update
        </AppLink>
        <AppLink
        to="/"
        onClick={(e: any) => {
          e.preventDefault();
          props.onDeleteTemplate();
          handleClose()
        }}
        >
        <DeleteOutline />
          Delete
        </AppLink>
      </Popover>
  </div>
}

export default TemplateActionMenu;