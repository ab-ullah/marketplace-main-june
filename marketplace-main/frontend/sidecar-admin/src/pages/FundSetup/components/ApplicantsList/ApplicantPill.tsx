import { FunctionComponent, memo } from "react";
import get from "lodash/get";
import { getPillsColor, IStatus } from "./constants";
import { Label } from "../../../../components/Form/styles";
import { PillsWrapper } from "./styles";

interface IApplicantPill {
  label?: string;
  data: object;
  field: string;
  defaultValue?: string
}

const ApplicantPill: FunctionComponent<IApplicantPill> = ({
  label,
  data,
  field,
  defaultValue
}) => {

  const defaultStatus = defaultValue ? defaultValue : IStatus.NA
  return (
    <>
      {label && <Label className="d-block">{label}</Label>}
      <PillsWrapper color={getPillsColor(data, field, defaultValue)}>
        {get(data, field) ? get(data, field) : defaultStatus}
      </PillsWrapper>
    </>
  );
};

export default memo(ApplicantPill);
