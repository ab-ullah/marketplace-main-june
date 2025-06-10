import uniqBy from "lodash/uniqBy";

export interface ILeverageInfo {
  value: number,
  multiple: number,
  label: string,
  description: string
}

export const getUniqueLeverageRatios = (leverages: ILeverageInfo[]) => {
  return uniqBy(leverages, 'multiple')
}

export const getLeveredAndUnleveredAmount = (investmentAmount: number, maxLeveredCommitmentAmount=0) => {
  const output = { leveredAmount: 0, unleveredAmount: 0 };
  if (maxLeveredCommitmentAmount) {
    const diff = investmentAmount - maxLeveredCommitmentAmount;
    if (diff > -1) {
      output.leveredAmount = maxLeveredCommitmentAmount;
      output.unleveredAmount = diff;
    } else {
      output.leveredAmount = investmentAmount;
    }
  }
  else {
    output.leveredAmount = investmentAmount
  }

  return output;
};