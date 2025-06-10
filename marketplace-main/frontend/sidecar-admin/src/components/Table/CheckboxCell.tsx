import { FC } from "react";
import { Cell } from "rsuite-table";
import get from "lodash/get";
import isFunction from "lodash/isFunction";
import { EmptyCell } from "./styles";

const CheckBoxCell: FC<any> = ({
  rowData,
  dataKey,
  className,
  getCheckBoxProps,
  onChange,
  checked,
  disabled,
  ...props
}) => {
  const data = get(rowData, dataKey) || null;
  checked = isFunction(checked) ? checked(data, rowData) : checked;
  disabled = isFunction(disabled) ? disabled(data, rowData) : disabled;
  const checkBoxProps = isFunction(getCheckBoxProps)
    ? getCheckBoxProps(rowData)
    : {};
if (rowData?.isFooter)
  return (
    <Cell>
      <EmptyCell>-</EmptyCell>
    </Cell>
  );
  return (
    <Cell {...props}>
      <input
        type="checkbox"
        value={data}
        checked={checked}
        disabled={disabled}
        onChange={(e: any) => onChange(data)}
        {...checkBoxProps}
      />
    </Cell>
  );
};

export default CheckBoxCell;
