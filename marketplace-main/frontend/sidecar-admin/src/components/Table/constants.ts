import { cloneDeep, get } from "lodash";

export const getTableWidth = (column: any,allowColMinWidth?: boolean) => {
    const data: any = {};
    if (column.width) data.width = column.width;
    if (column.flexGrow) {
      data.flexGrow = column.flexGrow;
      if (allowColMinWidth)
        data.minWidth = 100;
    }
    if (column.minWidth && allowColMinWidth) data.minWidth = column.minWidth;
    return data;
  };

  export const withFilter = (_data=[], filterInfo: any) => {
    let filteredData = cloneDeep(_data)

    const FilterKeys = Object.keys(filterInfo);

    if (FilterKeys.length > 0) {
      FilterKeys.forEach((filterKey) => {
        if (filterInfo[filterKey].length > 0) {
          filteredData = filteredData.filter((dat: any) =>
            filterInfo[filterKey].includes(dat[filterKey])
          );
        }
      });
    }
    return filteredData;
  };

export const sortData = (data: any[], sortColumn: string, sortType: 'asc' | 'desc') => {
    if(!data) return data
    if (sortColumn && sortType) {
      return [...data].sort((a, b) => {
        const x = get(a, sortColumn);
        const y = get(b, sortColumn);
        if (typeof x === 'string' && typeof y === 'string') {
          return sortType === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
        }
        return 0;
      });
    }
    return data;
  };