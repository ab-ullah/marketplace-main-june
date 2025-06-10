export const stringFoundIn = (str: string, ...arr: Array<string | null | number>) => {
  return arr.some(s => typeof s === 'string' ? s.toLowerCase().includes(str.toLowerCase()): typeof s ==='number'?s.toString().toLowerCase().includes(str.toString().toLowerCase()):null)
}