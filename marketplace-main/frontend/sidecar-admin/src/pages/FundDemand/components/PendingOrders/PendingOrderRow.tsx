import React, {FunctionComponent, useState} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {StyledButton} from "../../../../presentational/buttons";
import {COMPLETED} from "../../../../constants/orderStates";
import API from "../../../../api";
import {IOrder} from "../../../../interfaces/fundDetails";
import {useAppDispatch} from "../../../../app/hooks";
import {fetchFund} from "../../thunks";


interface PendingOrderRowProps {
  order: IOrder,
  externalId: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    },
  }),
);

const PendingOrderRow: FunctionComponent<PendingOrderRowProps> = ({order, externalId}) => {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [sellAmount, setSellAmount] = useState<number>(0)
  const totalRequest = order.requested_allocation + order.requested_leverage

  const canSell = sellAmount && sellAmount > 0 && sellAmount <= totalRequest;

  const updateOrder = async () => {
    const payload = {
      status: COMPLETED,
      approved_allocation: sellAmount,
    }
    await API.updateOrder(order.id, payload)
    dispatch(fetchFund(externalId));
  }

  return <TableRow key={`${order.id}-row`}>
    <TableCell component="th" scope="row">{order.ordered_by_name}</TableCell>
    <TableCell align="left">{order.requested_allocation}</TableCell>
    <TableCell align="left">{order.requested_leverage}</TableCell>
    <TableCell align="left">{totalRequest}</TableCell>
    <TableCell align="left">
      <form className={classes.root} noValidate autoComplete="off">
        <TextField
          id="standard-number"
          type="number"
          value={sellAmount}
          onChange={(e) => setSellAmount(parseInt(e.target.value))}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </form>
    </TableCell>
    <TableCell align="left">{sellAmount ? sellAmount : 0}</TableCell>
    <TableCell align="left">{canSell ?
      <StyledButton variant={'outline-success'} onClick={updateOrder}>Save</StyledButton> :
      '-'
    }</TableCell>
  </TableRow>

};

export default PendingOrderRow;
