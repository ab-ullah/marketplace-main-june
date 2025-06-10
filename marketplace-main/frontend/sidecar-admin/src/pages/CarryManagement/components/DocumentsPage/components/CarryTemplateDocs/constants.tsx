import get from "lodash/get";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import { getPillColor } from "../../../../constants";
import { StatusPill } from "../../../styles";
import MenuIcon from "@material-ui/icons/MoreVert";
import Popover from "@material-ui/core/Popover";
import { useState, MouseEvent, useEffect } from "react";
import FilePreviewModal from "../../../../../../components/FilePreviewModal";

export const getColumns = (handleToggleActivateDoc: any, handleDocumentToEdit:any,handleDocToPreview:any) => [
  {
    title: "Document",
    fixed: "left",
    dataKey: "name",
    minWidth: 200,
    flexGrow: 1.3,
  },
  {
    title: "Date",
    dataKey: "created_at",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.created_at)}</span>,
  },
  {
    title: "Type",
    dataKey: "document_type_display",
    minWidth: 200,
    flexGrow: 1.3,
  },
  {
    title: "Signature Settings",
    dataKey: "requirements_display",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) => (
      <StatusPill color={getPillColor(get(row, "requirements_display", ""))}>
        {get(row, "requirements_display")}
      </StatusPill>
    ),
  },
  {
    title: "Frequency Settings",
    dataKey: "show_everytime",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) => {
      const displayText = get(row, "show_everytime", false)
        ? "Every Time"
        : "Once";
     
      return <span>{displayText}</span>;
    },
  },
  {
    title: "Document Status",
    dataKey: "doc_status",
    minWidth: 200,
    flexGrow: 1.3,
    Cell: (row: any) => {
      const displayText = get(row, "document_status", "")
        ? "Active"
        : "Inactive";
      const color = get(row, "document_status", "") ? "#10AC84" : "#000000";
      return <StatusPill color={color}>{displayText}</StatusPill>;
    },
  },
  {
    title: "",
    dataKey: "actions",
    fixed:'right',
    Cell: (row: any) => {
      const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null);
      const [isDisplayDoc,setIsDisplayDoc]=useState(false)

      const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event && event.currentTarget) setAnchorEl(event?.currentTarget);
      };

      const handleClose = () => {
        setAnchorEl(null);
        setTimeout(()=>setIsDisplayDoc(false),1000)
        
      };

      const handleActivateDeactivate = (row: any) => {
        handleClose();
        handleToggleActivateDoc(row);
      };

      const statusText = get(row, "document_status", "")
        ? "Deactivate"
        : "Activate";
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
              onClick={() => handleActivateDeactivate(row)}
            >
              <span>{statusText}</span>
            </div>
            {/* <div className="px-3 py-2 cursor-pointer" onClick={()=>setIsDisplayDoc(true)}>
            {anchorEl?
              <FilePreviewModal
                documentId={get(row, "document.document_id")}
                documentName={get(row, "document.title")}
                customDisplayButton={<span>View</span>}
              />
              :
              <span>View</span>
             }
            </div> */}
            <div
              className="px-3 py-2 cursor-pointer"
              onClick={() => {handleClose(); handleDocToPreview(get(row,'document'))}}
            >
              <span>View</span>
            </div>
            <div
              className="px-3 py-2 cursor-pointer"
              onClick={() =>{ handleClose(); handleDocumentToEdit(row);}}
            >
              <span>Edit</span>
            </div>
          </Popover>
        </div>
      );
    },
  },
];
