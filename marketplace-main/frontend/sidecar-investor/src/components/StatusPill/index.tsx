import {Label, PillsWrapper} from "./styles";
import {FunctionComponent} from "react";
import {getPillsColor, IStatus} from "../../pages/ApplicationView/Components/constants";
import get from "lodash/get";


interface IApplicantPill {
  label: string;
  data: object;
  field: string;
}


const StatusPill: FunctionComponent<IApplicantPill> = (
  {
    label,
    data,
    field,
  }
) => {
  return (
    <>
      <Label className="d-block">{label}</Label>
      <PillsWrapper color={getPillsColor(data, field, IStatus.NA)} className={field}>
        {get(data, field) ? get(data, field) : IStatus.NA}
      </PillsWrapper>
    </>
  );
};

export default StatusPill;
