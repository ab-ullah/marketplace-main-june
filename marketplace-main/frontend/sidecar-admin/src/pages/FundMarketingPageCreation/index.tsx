import React, {FunctionComponent, useEffect} from 'react';

import {useParams} from "react-router-dom";
import CreationWizard from "../../components/CreationWizard";
import FundPageBlock from "./components/BlocksList";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchFundPageDetail, fetchIcons} from "./thunks";
import {selectFundMarketingPageDetail} from "./selectors";
import CreationForm from "./components/CreationForm";
import SubmitForReviewModal from "./components/SubmitForReviewModel";


interface EligibilityFormCreationProps {
}


const FundMarketingPageCreation: FunctionComponent<EligibilityFormCreationProps> = () => {
  const {marketingPageId} = useParams<{ marketingPageId: string }>();
  const dispatch = useAppDispatch()
  const marketingPageDetail = useAppSelector(selectFundMarketingPageDetail)

  useEffect(() => {
    dispatch(fetchFundPageDetail(parseInt(marketingPageId)))
    dispatch(fetchIcons())
  }, [])

  if (!marketingPageDetail) return <></>


  return <CreationWizard
    key={`fmp-${marketingPageDetail.id}`}
    heading={'Fund Marketing Page'}
    previewButtonText={'Preview'}
    previewButtonLink={`/admin/marketingPage/${marketingPageDetail.id}/preview`}
    leftPane={<FundPageBlock/>}
    middlePane={<CreationForm marketingPageDetail={marketingPageDetail}/>}
    submitForReviewModal={<SubmitForReviewModal marketingPageDetail={marketingPageDetail}/>}
  />
};

export default FundMarketingPageCreation;
