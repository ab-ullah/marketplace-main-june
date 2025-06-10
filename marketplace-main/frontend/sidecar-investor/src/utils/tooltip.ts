import { ITooltip } from "../interfaces/carryManagement";

export const getTooltip = (key: string, tooltips: {key: string; tooltip: ITooltip}[]) => {
    return tooltips.find((tooltip) => tooltip.key === key);
  }