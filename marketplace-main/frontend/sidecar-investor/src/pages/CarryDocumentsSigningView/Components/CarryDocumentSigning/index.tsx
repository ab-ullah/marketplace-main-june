import React, {FunctionComponent} from 'react';
import API from "../../../../api";
import classNames from "classnames";
import { useCompanyPrefix } from '../../../../utils/hooks';
import {ICarryDocument} from "../../../../interfaces/carryManagement";
import { FileLink } from '../../../Agreements/styles';
import {Status} from "../../../Agreements/components/ApplicantDocument/styles";


interface CarryDocumentSigningProps {
    carryDocument: ICarryDocument;
    setIsSubmitting: (arg0: boolean) => void
}


const CarryDocumentSigning: FunctionComponent<CarryDocumentSigningProps> = ({
                                                                                            carryDocument,
                                                                                            setIsSubmitting
                                                                                        }) => {
    const {companyPrefix} =useCompanyPrefix()
    const getSigningUrl = async () => {
        if (carryDocument.gp_signing_complete) return;
        setIsSubmitting(true)
        const {host, protocol} = window.location;
        const carryDocumentId = carryDocument.id;
        const return_url = encodeURIComponent(
            `${protocol}//${host}${companyPrefix}/investor/carry-plans/documents/signature/envelopeId`
        );
        const response = await API.getCarrySigningURL(carryDocumentId, return_url);
        window.open(response.signing_url, "_self");
        return response;
    };
    return <tr key={carryDocument.id}>
        <td className={'cursor-pointer'}>
            <div
                onClick={getSigningUrl}
                className={classNames({'underlined': !carryDocument.is_gp_signature_required})}
            >
                <FileLink>
                    {carryDocument.document.title}
                </FileLink>
            </div>
        </td>
        <td>
            <Status>{carryDocument.status}</Status>
        </td>
    </tr>
};

export default CarryDocumentSigning;
