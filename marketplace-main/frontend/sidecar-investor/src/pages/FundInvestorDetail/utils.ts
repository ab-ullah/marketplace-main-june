import { filterColumns } from "../../utils/RenderTablesDynamically"

export const getCSVColumns = (columns: any[], isLegacy: boolean) => {
    return filterColumns(columns, isLegacy).map((col: any) => ({
        title: col.heading,
        dataKey: col.field_name 
    }))
}