import React, {FunctionComponent} from 'react';
import {createStyles, Theme, withStyles} from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import PublishedUnpublishedTooltip from "./tooltip";


const AntSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 28,
      height: 16,
      padding: 0,
      display: 'flex',
    },
    switchBase: {
      padding: 2,
      color: theme.palette.grey[500],
      '&$checked': {
        transform: 'translateX(12px)',
        color: theme.palette.common.white,
        '& + $track': {
          opacity: 1,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
        },
      },
    },
    thumb: {
      width: 12,
      height: 12,
      boxShadow: 'none',
    },
    track: {
      border: `1px solid ${theme.palette.grey[500]}`,
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: theme.palette.common.white,
    },
    checked: {},
  }),
)(Switch);


interface UnpublishedToggleProps {
  showUnpublished: boolean;
  onChange: (args0: boolean) => void
}

const UnpublishedToggle: FunctionComponent<UnpublishedToggleProps> = ({onChange, showUnpublished}) => {


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return <Grid component="label" container alignItems="center" spacing={1}>
    <Grid item>Show Unpublished Funds</Grid>
    <Grid item>
      <AntSwitch checked={showUnpublished} onChange={handleChange} name="currencyToggle"/>
    </Grid>
    <Grid item><PublishedUnpublishedTooltip/></Grid>
  </Grid>
};

export default UnpublishedToggle;
