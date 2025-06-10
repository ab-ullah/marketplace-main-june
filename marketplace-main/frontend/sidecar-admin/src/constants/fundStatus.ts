import get from "lodash/get";

export const SETUP = 'setup'
export const PUBLISHED = 'published'

export enum IStatus {
    SETUP = 'setup',
    PUBLISHED = 'published',
}
  

export const colors = {
    [IStatus.SETUP]: "#B0BEC5",
    [IStatus.PUBLISHED]: "#E37628",
};
  
  
  export const getPillsColor = (status: string) => {
    const value = status || IStatus.SETUP;
    return get(colors, value, "#B0BEC5");
  };