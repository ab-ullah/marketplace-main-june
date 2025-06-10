import DOMPurify from 'dompurify'
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import {DocTitle, DeleteIconWrapper} from "./styles";
import * as Yup from "yup";
import moment from "moment";

export const INITIAL_VALUES = {
  "document_file": "",
  "document_name": "",
  "document_description": "",
}


export const VALIDATION_SCHEMA = Yup.object({
  "document_name": Yup.string().required("Required"),
  "document_description": Yup.string().required("Required"),
});


export const getColumns = (showDocDetails: any, deleteAdminDocument: any) => {
  return [
    {
      title: "Name",
      dataKey: "document_name",
      flexGrow: 0.5,
      minWidth: 250,
      Cell: (data: any) => (
        <DocTitle onClick={() => showDocDetails(data.id)}>
          {data.document_name}
        </DocTitle>
      ),
    },
    {
      title: "Description",
      dataKey: "document_description",
      flexGrow: 1,
      minWidth: 250,
      Cell: (data: any) => (
        <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(data.document_description)}}/>
      ),
    },
    {
      title: "Uploaded By",
      dataKey: "uploaded_by_admin",
      flexGrow: 1,
      minWidth: 250,
      Cell: (data: any) => (
        <>
          {data.uploaded_by_admin}
        </>
      ),
    },
    {
      title: "Uploaded On",
      dataKey: "uploaded_on",
      flexGrow: 1,
      minWidth: 250,
      Cell: (data: any) => (
        <>
          {moment(data.uploaded_on).format('YYYY-MM-DD hh:mm:ss A')}
        </>
      ),
    },
    {
      title: "Actions",
      dataKey: "action",
      flexGrow: 0.5,
      Cell: (data: any) => (
        <DeleteIconWrapper>
          <TrashIcon onClick={() => deleteAdminDocument(data.id)}/>
        </DeleteIconWrapper>
      ),
    },
  ];
}