import * as Yup from "yup";

export const getColumns = (setSelected: any) => [
    {
        title: "Name",
        fixed: "left",
        dataKey: "legal_name",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span
            style={{
              cursor: "pointer",
              fontWeight: 900,
              textDecoration: "underline",
            }}
            onClick={() => {setSelected(row)}}
          >
            {row.legal_name}
          </span>
        ),
      }
]

export const INIT_DATA = {
  legal_name: '',
  description: '',
  vesting_schedule: null
}

export const VALIDATION_SCHEMA = Yup.object({
  legal_name: Yup.string().required('Please enter name').nullable(),
  description: Yup.string().required('Please enter description').nullable(),
  vesting_schedule: Yup.mixed().test(
    'is-object-or-number-or-undefined',
    'Please select a valid vesting schedule',
    (value) => {
      if (value === undefined || value === null) return true; // Allow optional field
      return typeof value === 'object' || typeof value === 'number';
    }
  ).nullable()
});