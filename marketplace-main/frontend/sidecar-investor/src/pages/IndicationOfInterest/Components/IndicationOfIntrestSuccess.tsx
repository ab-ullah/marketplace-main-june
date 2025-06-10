import {FC, memo} from 'react'
import {Button} from 'react-bootstrap'
import {useHistory} from "react-router";
import { SuccessMessageWrapper } from '../styles';
import { useCompanyPrefix } from '../../../utils/hooks';
import { getHomepageUrl } from '../../../utils/routes';

interface IIndicationOfInterestSuccessProps {
}

const IndicationOfInterestSuccess: FC<IIndicationOfInterestSuccessProps> = () => {
    const history = useHistory()
    const {companyPrefix} =useCompanyPrefix()
    return <SuccessMessageWrapper>
        <h1 className={'mt-3 mb-3'}>Thank you for your interest!</h1>
        <h4 className={'mt-3'}>We will be in touch soon with next steps.</h4>
        <Button
          variant='primary'
          className='mt-4 mb-5'
          onClick = {() => window.open(getHomepageUrl(companyPrefix),'_self')}
        >
            Go to my homepage
        </Button>
    </SuccessMessageWrapper>
}

export default memo(IndicationOfInterestSuccess)