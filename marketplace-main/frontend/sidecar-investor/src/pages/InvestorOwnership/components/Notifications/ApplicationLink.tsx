import React, { FC } from 'react';
import StyledBadge from '../../../../presentational/StyledBadge';
import { useHistory } from 'react-router-dom';
import { useCompanyPrefix } from '../../../../utils/hooks';

const ApplicationLink: FC<any> = ({fundExtenalId}) => {

    const history = useHistory()
    const {companyPrefix} = useCompanyPrefix()

    const handleApplicationClick = () => {
        const applicationUrl = `${companyPrefix}/investor/funds/${fundExtenalId}/application`
        history.push(applicationUrl);
    }

    return (
        <div>
      <StyledBadge
        className={'cursor-pointer'}
        pill
        bg={'primary'}
        onClick={handleApplicationClick}
      >
        View Application
      </StyledBadge>
    </div>
    )
}

export default ApplicationLink;