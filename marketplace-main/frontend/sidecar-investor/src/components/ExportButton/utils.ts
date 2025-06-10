import { get } from "lodash";

const canBeNumber = (value: any) => {
  return !isNaN(value) && value.trim() !== '';
}

export const getHeader = (columns: any) =>
  columns
    .map((column: any) => {
      if (column.title) return column.title;
      return undefined
    })
    .filter((item: undefined) => item !== undefined);

export const getRows = (columns: any, data: any) => {
  const rows: any[] = [];
  const dataKeys = columns
    .map((column: any) => {
      if (column.dataKey && column.title) {
        return column.dataKey;
      }
      return undefined
    })
    .filter((item: undefined) => item !== undefined);
  data.forEach((fund: any) => {
    const row: any = [];
    dataKeys.forEach((key: string) => {
      const val = get(fund, key, "")
      if(Array.isArray(val)){
        row.push(val?.length)
      }
      else {
        if(typeof val === 'number') {
          row.push(val.toFixed(2))
        }
        else if (typeof val === 'string') {
          if(canBeNumber(val)) {
            row.push(Number(val).toFixed(2))
          }
          else {
            row.push(val)
          }
        }
        else {
          row.push(val)
        }
      }
    });
    rows.push(row);
  });
  return rows;
};
