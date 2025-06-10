import {makeStyles} from '@material-ui/core/styles';
import styled from 'styled-components';
import Select from "react-select";

export const useStyles = makeStyles({
    docWrapper: {
      display: "flex",
      borderBottom: "1px dashed #cbd2dd"
    },
    docCell: {
        flex: 1,
    }
  });

  export const DropdownWrapper = styled.div`
    margin-top: 10px;
  `

export const StyledSelect = styled(Select)`
  .select__multi-value__label {
    word-wrap: break-word;
    word-break: keep-all;
    white-space: break-spaces;
  }
`
