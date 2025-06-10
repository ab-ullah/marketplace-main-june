import React, { FC } from 'react';
import { DetailLabel, DetailValue, DetailWrapper } from '../styles';

const DetailRow: FC<any> =  ({
    label,
    value
}) => {
    return <DetailWrapper>
        <DetailLabel>{label}:</DetailLabel>
        <DetailValue>{value}</DetailValue>
    </DetailWrapper>
}

export default DetailRow;