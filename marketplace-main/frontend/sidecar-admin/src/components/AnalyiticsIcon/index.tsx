import React, { FunctionComponent } from 'react';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';

interface AnalyticsIconProps {
    onClick?: () => void
}

const AnalyticsButton: FunctionComponent<AnalyticsIconProps> = ({ onClick }) => {
    return <AssessmentOutlinedIcon onClick={onClick} className={'cursor-pointer'} style={{fill: '#2E86DE'}} />
};

export default AnalyticsButton;
