import { get } from "lodash";

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
      if(Array.isArray(get(fund, key, ""))){
        row.push(get(fund, key, "")?.length)
      }
      else {
        row.push(get(fund, key, ""));
      }
    });
    rows.push(row);
  });
  return rows;
};
