import TrashIcon from "@material-ui/icons/DeleteOutlined";
import * as Yup from "yup";
import { DeleteIconWrapper, DocTitle } from "../../../../components/CompanyInfo/styles";
import { dateFormatter } from "../../../../utils/dateFormatting";
import { get } from "lodash";

export const getFieldInfo: Record<string,any> = {
  document_type: {optionName:'document_types', paramName: 'document_type__in'} ,
  fund_name: {optionName:'fund_names', paramName: 'fund_name__in'} ,
  investor_name: {optionName:'investors', paramName: 'investor_name__in'} ,
  document_name: {optionName:'document_names', paramName: 'document_name__in'} ,
  created_at: { paramName: 'created_at__gte,created_at__lte'},
  file_date: { paramName: 'file_date__gte,file_date__lte'},
}

export const getColumns = (openDocumentDetails: any, deleteDocument: any, investorDocumentsFilters: Record<string,any>) => {
    return [
      {
        title: "Created At",
        dataKey: "created_at",
        flexGrow: 0.5,
        minWidth: 270,
        isSortable: true,
        externalDateRangeFilter:true,
        Cell: (data: any) => (
          <>
            {dateFormatter(data.created_at)}
          </>
        ),
      },
        {
            title: "Type",
            dataKey: "document_type",
            flexGrow: 0.5,
            minWidth: 270,
            filterOptions: get(investorDocumentsFilters,getFieldInfo["document_type"].optionName,[]),
            Cell: (data: any) => (
              <>
                {data.document_type}
              </>
            ),
        },
      {
        title: "Name",
        dataKey: "document_name",
        flexGrow: 0.5,
        minWidth: 250,
        isSortable: true,
        Cell: (data: any) => (
          <>
            <DocTitle onClick={() => openDocumentDetails(data.id)}>
          {data.title}
        </DocTitle>
          </>
        ),
      },
      {
        title: "Fund",
        dataKey: "fund_name",
        flexGrow: 0.5,
        minWidth: 270,
        filterOptions: get(investorDocumentsFilters,getFieldInfo['fund_name'].optionName,[]),
        Cell: (data: any) => {
          let fundName = '';
          if(data.fund){
            fundName = data.fund.name
          }
          else if(data.investor_fund){
            fundName = data.investor_fund.name
          }
          return (
            <>
              {fundName}
            </>
          )
        },
      },
      {
        title: "Investor",
        dataKey: "investor_name",
        flexGrow: 0.5,
        minWidth: 270,
        filterOptions: get(investorDocumentsFilters,getFieldInfo['investor_name'].optionName,[]),
        Cell: (data: any) => {
          const text = data.investor ? `${data.investor.name} - ${data.investor.investor_account_code}` : ""
          return <>
            {text}
          </>
        },
      },
      {
        title: "Document Date",
        dataKey: "file_date",
        flexGrow: 0.5,
        isSortable: true,
        minWidth: 270,
        externalDateRangeFilter:true,
        Cell: (data: any) => (
          <>
            {dateFormatter(data.file_date)}
          </>
        ),
      },
      {
        title: "",
        dataKey: "action",
        flexGrow: 0.5,
        Cell: (data: any) => (
          <DeleteIconWrapper>
            <TrashIcon onClick={() => deleteDocument(data)} />
          </DeleteIconWrapper>
        ),
      }
    ];
  }

export const VALIDATION_SCHEMA = Yup.object({
    document_for: Yup.object().shape({
      label: Yup.string().required('Required'),
      value: Yup.string().required('Required'),
    }).required("Required").nullable(),
    selected_fund: Yup.object().shape({
      label: Yup.string().required('Required'),
      value: Yup.string().required('Required'),
    }).required('Required').nullable(),
    selected_investor: Yup.object().shape({
      label: Yup.string().required('Required'),
      value: Yup.string().required('Required'),
    }).when('document_for', {
      is: (...fields: any) => {
        const [document_for] = fields;
        return document_for.value === 'document_for_investor'
      },
      then: Yup.object().shape({
        label: Yup.string().required('Required'),
        value: Yup.string().required('Required'),
      }).required('Required').nullable(),
      otherwise: Yup.object().shape({
        label: Yup.string().required('Required'),
        value: Yup.string().required('Required'),
      }).notRequired().nullable()
    }),
    "document_name": Yup.string().required("Required"),
    "document_date": Yup.string().required("Required"),
    "document_file": Yup.mixed().required("Required"),
    "document_type":  Yup.object().shape({
      label: Yup.string().required('Required'),
      value: Yup.string().required('Required'),
    }).required("Required").nullable(),
    "due_date": Yup.string().when('document_type', {
      is: (...fields: any) => {
        const [document_type] = fields;
        return ['capital-call', 'capital-calls'].includes(document_type?.value)
      },
      then: Yup.string().required("Required"),
      otherwise: Yup.string().notRequired()
    }),
  });

  export const UPDATE_VALIDATION_SCHEMA = Yup.object({
    "document_name": Yup.string().required("Required"),
    "document_date": Yup.string().required("Required"),
    "document_type":  Yup.object().shape({
      label: Yup.string().required('Required'),
      value: Yup.string().required('Required'),
    }).required("Required").nullable(),
  });
