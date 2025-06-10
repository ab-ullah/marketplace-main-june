import get from "lodash/get";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
// import { getPillColor } from "../../../../constants";
import { StatusPill } from "../../../styles";
import { getPillColor } from "../../../../constants";
import { useState,MouseEvent } from "react";
import MenuIcon from "@material-ui/icons/MoreVert";
import Popover from "@material-ui/core/Popover";
import FilePreviewModal from "../../../../../../components/FilePreviewModal";

export const getColumns = (handleDocToPreview:any, handleGpSign:any, handleReleaseDocument:any,handleDeleteDocument:any) => [
  {
    title: "Participant",
    dataKey: "participant_name",
    minWidth: 200,
    flexGrow: 1.3,
  },
  {
    title: "Document",
    dataKey: "carry_document_name",
    minWidth: 200,
    flexGrow: 1.3,
  },
  {
    title: "Type",
    dataKey: "document_type_display",
    minWidth: 200,
    flexGrow: 1.3,
  },

  {
    title: "Status",
    dataKey: "status",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) => (
      <StatusPill color={getPillColor(get(row, "status", ""))}>
        {get(row, "status")}
      </StatusPill>
    ),
  },
  {
    title: "",
    dataKey: "actions",
    fixed:'right',
    Cell: (row: any) => {
      const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null);

      const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event && event.currentTarget) setAnchorEl(event?.currentTarget);
      };

      const handleClose = () => {
        setAnchorEl(null);
      };
      return (
        <div>
          <div
            style={{ display: "inline-block", cursor: "pointer" }}
            onClick={handleClick}
          >
            <MenuIcon />
          </div>
          <Popover
            id={"activate"}
            open={Boolean(anchorEl)}
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
            // style={{
            //   opacity: isDisplayDoc? 0:1
            // }}
          >
            <div
              className="px-3 py-2 cursor-pointer"
              onClick={() => {handleClose(); handleDocToPreview(row.completed ? get(row,'signed_document') : get(row,'document'))}}
            >
              <span>View</span>
            </div>
            <div
              className="px-3 py-2 cursor-pointer"
              onClick={() => {handleClose(); handleGpSign(row)}}
              style={(row.gp_signing_complete || !row.envelope_id)?{opacity:'0.5',cursor:'not-allowed'}:{}}
            >
              <span>Sign</span>
            </div>
            <div
              className="px-3 py-2 cursor-pointer"
              onClick={() => {handleClose(); handleReleaseDocument(row);}}
              style={(row.is_released)?{opacity:'0.5',cursor:'not-allowed'}:{}}
            >
              <span>Release</span>
            </div>
            <div
              className="px-3 py-2 cursor-pointer"
              onClick={() => {handleClose(); handleDeleteDocument(row)}}
            >
              <span>Delete</span>
            </div>
            {/* <div className="px-3 py-2 cursor-pointer" onClick={()=>setIsDisplayDoc(true)}>
             {anchorEl &&
              <FilePreviewModal
                documentId={get(row, "document.document_id")}
                documentName={get(row, "document.title")}
                customDisplayButton={<span>View</span>}
              />
             }
            </div> */}
          </Popover>
        </div>
      );
    },
  },
];
