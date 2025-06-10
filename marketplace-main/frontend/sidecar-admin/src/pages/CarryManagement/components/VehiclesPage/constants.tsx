import * as Yup from "yup";

export const getColumns = (selectVehcileToView: any) => [
    {
      title: "Common Display Name",
      fixed: "left",
      dataKey: "common_name",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span
          style={{ cursor: "pointer", textDecoration:'underline' }}
          onClick={() => selectVehcileToView(row)}
        >
          {row.common_name}
        </span>
      ),
    },
    {
        title: "Vehicle Legal Name",
        fixed: "left",
        dataKey: "legal_name",
        width: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span
            style={{ cursor: "pointer", textDecoration:'underline' }}
            onClick={() => selectVehcileToView(row)}
          >
            {row.legal_name}
          </span>
        ),
      },
  ];

  export const VEHICLE_TABLE_COLUMNS = [
    {
        title: "Name",
        fixed: "left",
        dataKey: "template_share_class.legal_name",
        width: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span
          >
            {row.template_share_class?.legal_name}
          </span>
        ),
      },
  ]

 export const CARRY_VEHCILE_TABS ={
    VEHICLE_DETAILS:'vehicle-details',
    CARRY_SHARE_CLASSES:'vehicle-share-classes'
  }

  export const tabsStepperConfig:any[]=[
    {
      title:'Create Vehicle',
      key:CARRY_VEHCILE_TABS.VEHICLE_DETAILS
    },
    {
      title:'Add Share Classes',
      key:CARRY_VEHCILE_TABS.CARRY_SHARE_CLASSES

    }
  ]

export const VEHICLE_DETAILS_INIT_DATA = {
    common_name: '',
    legal_name: ''
}

export const VALIDATION_SCHEMA = Yup.object({
    legal_name: Yup.string().required('Please enter legal name').nullable(),
    common_name: Yup.string().required('Please enter common name').nullable(),
  });