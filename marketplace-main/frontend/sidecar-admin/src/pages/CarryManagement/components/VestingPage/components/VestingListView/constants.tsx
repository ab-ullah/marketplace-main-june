export const getColumns = (selectScheduleToView: any) => [
    {
      title: "Schedule Name",
      fixed: "left",
      dataKey: "name",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span
          style={{ cursor: "pointer", textDecoration:'underline' }}
          onClick={() => selectScheduleToView(row.id)}
        >
          {row.name}
        </span>
      ),
    },
  ];