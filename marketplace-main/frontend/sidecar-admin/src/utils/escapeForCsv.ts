import isString from "lodash/isString";

export const escapeStringForCsv = (val: string) => {
  if (!isString(val)) return val
  if (val.startsWith('"') && val.endsWith('"')) return val
  const quotesEscaped = val.replace(/"/g, "'")
  return `"${quotesEscaped}"`
}