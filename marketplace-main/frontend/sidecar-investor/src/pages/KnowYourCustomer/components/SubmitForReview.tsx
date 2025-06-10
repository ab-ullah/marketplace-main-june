import React, { FunctionComponent } from 'react';
import API from '../../../api';
import { Button } from '../styles';
import { useFormikContext } from 'formik';
import { fetchKYCRecord } from '../thunks';
import { STATUS_CODES } from '../constants';
import { selectKYCRecord } from '../selectors';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

const SubmitForReview: FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const { kycRecordId, workflow } = useAppSelector(selectKYCRecord);
    const { setFieldError } = useFormikContext();

    const markAsReadyForReview = async () => {
        try {
            await API.updateKYCRecordStatus(workflow!.slug, kycRecordId!, STATUS_CODES.SUBMITTED);
        } catch (e: any) {
            const error = e.response.data as { [key: string]: string[] }
            Object.entries(error).forEach(([field, errors]) => {
                if (Array.isArray(errors)) {
                    const fieldError = errors.join(' ')
                    setFieldError(field, fieldError)
                }
            })
        } finally {
            dispatch(fetchKYCRecord(workflow!.slug));
        }
    }

    return <Button
        onClick={markAsReadyForReview}
        disabled={kycRecordId === null}>
        Submit for review
    </Button>
}

export default SubmitForReview;