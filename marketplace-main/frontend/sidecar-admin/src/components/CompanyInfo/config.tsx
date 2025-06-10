import DOMPurify from 'dompurify'
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import { DocTitle, DeleteIconWrapper } from "./styles";

export const getColumns = (showDocDetails: any, deleteCompanyProfile: any) => {
  return [
    {
      title: "Name",
      dataKey: "name",
      flexGrow: 0.5,
      minWidth: 250,
      Cell: (data: any) => (
        <DocTitle onClick={() => showDocDetails(data.id)}>
          {data.name}
        </DocTitle>
      ),
    },
    // {
    //   title: "Description",
    //   dataKey: "description",
    //   flexGrow: 1,
    //   minWidth: 250,
    //   Cell: (data: any) => (
    //     <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description)}} />
    //   ),
    // },
    {
      title: "Required Once",
      dataKey: "required_once",
      flexGrow: 0.5,
      minWidth: 270,
      Cell: (data: any) => (
        <>
          {data.required_once ? "Yes" : "No"}
        </>
      ),
    },
    {
      title: "Required Signature",
      dataKey: "required_sign",
      flexGrow: 0.5,
      minWidth: 270,
      Cell: (data: any) => (
        <>
          {data.require_signature ? "Yes" : "No"}
        </>
      ),
    },
    {
      title: "Required Wet Signature",
      dataKey: "require_wet_signature",
      flexGrow: 0.5,
      minWidth: 270,
      Cell: (data: any) => (
        <>
          {data.require_wet_signature ? "Yes" : "No"}
        </>
      ),
    },
    {
      title: "",
      dataKey: "action",
      flexGrow: 0.5,
      Cell: (data: any) => (
        <DeleteIconWrapper>
          <TrashIcon onClick={() => deleteCompanyProfile(data.id)} />
        </DeleteIconWrapper>
      ),
    },
  ];
}