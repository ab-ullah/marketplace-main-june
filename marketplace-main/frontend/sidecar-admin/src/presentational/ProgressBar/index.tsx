import React, { Component } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { BarWrapper } from './styles';

interface IProgressBarProps {
  isLoading?: boolean;
}
interface IProgressBarStates {
  totalProgress: number;
}
const initProgress = 0;
const range = {
  min: 0,
  max: 100,
};
const config = {
  threshold: 90,
  updateTimeInterval: 700,
  progressIncrement: 2,
};

class ProgressBar extends Component<IProgressBarProps, IProgressBarStates> {
  interval: any;
  constructor(props: any) {
    super(props);
    this.state = { totalProgress: initProgress };
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.isLoading === false && this.props.isLoading === true)
      this.updateProgress();
    else if (prevProps.isLoading === true && this.props.isLoading === false)
      this.endProgress();
  }

  setProgress = (totalProgress: number) =>
    this.setState({
      totalProgress,
    });

  /**
   * update to progress to 100% and after that hide the progressbar after 1 sec
   */
  endProgress = () => {
    this.setProgress(range.max);
    setTimeout(() => {
      this.setProgress(initProgress);
    }, 1000);
  };
  /**
   * keep incrementing the progress until progress reach to threshold limit of config
   * or props.loading becomes false
   */
  updateProgress = () => {
    const { threshold, updateTimeInterval, progressIncrement } = config;
    const { totalProgress } = this.state;
    const { isLoading } = this.props;
    clearTimeout(this.interval);
    if (totalProgress >= threshold || isLoading === false) {
      return;
    }
    this.setProgress(totalProgress + progressIncrement);
    this.interval = setTimeout(this.updateProgress, updateTimeInterval);
  };

  render() {
    const { totalProgress } = this.state;
    const { min, max } = range;
    return (
      <BarWrapper>
        {totalProgress > min && totalProgress <= max && (
          <LinearProgress variant="determinate" value={totalProgress} />
        )}
      </BarWrapper>
    );
  }
}

export default ProgressBar;
