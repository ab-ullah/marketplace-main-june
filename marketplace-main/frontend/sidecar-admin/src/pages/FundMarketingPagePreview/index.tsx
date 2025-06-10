import React, {FunctionComponent, useEffect} from 'react';

import {Link, useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchPreviewFundPageDetail} from "./thunks";
import {selectPreviewFundMarketingPage} from "./selectors";
import {PreviewContainer} from "./styles";
import FundHeader from "./components/Header";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FundInfoTable from "./components/InfoTable";
import Promo from "./components/Promo";
import Documents from "./components/Documents";
import RequestAllocation from "./components/RequestAllocation";
import HelpBlocks from "./components/HelpBlocks";
import Footer from "../../components/Footer";
import ContactInfo from "../../components/Contact";
import {ADMIN_URL_PREFIX} from "../../constants/routes";
import Button from "react-bootstrap/Button";
import {PageHeader} from "../EligibilityCriteriaPreview/styles";
import SubmitForReviewModal from "../FundMarketingPageCreation/components/SubmitForReviewModel";


interface FundMarketingPagePreviewProps {
}


const FundMarketingPagePreview: FunctionComponent<FundMarketingPagePreviewProps> = () => {
  const {marketingPageId} = useParams<{ marketingPageId: string }>();
  const dispatch = useAppDispatch()
  const marketingPageDetail = useAppSelector(selectPreviewFundMarketingPage)

  useEffect(() => {
    dispatch(fetchPreviewFundPageDetail(parseInt(marketingPageId)))
  }, [])

  if (!marketingPageDetail) return <></>

  return <>
    <PreviewContainer fluid>
      <PageHeader>
        <Link to={`/${ADMIN_URL_PREFIX}/marketingPage/${marketingPageDetail.id}/edit`}>
          <Button variant="outline-primary float-start btn-back-to-edit">Back to edit</Button>
        </Link>
        <SubmitForReviewModal marketingPageDetail={marketingPageDetail}/>
      </PageHeader>
      <FundHeader previewFundPage={marketingPageDetail}/>
      <Row>
        <Col md={6}>
          <FundInfoTable previewFundPage={marketingPageDetail}/>
        </Col>
        <Col md={6}>
          <Promo previewFundPage={marketingPageDetail}/>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Documents previewFundPage={marketingPageDetail}/>
        </Col>
        <Col md={6}>
          <RequestAllocation previewFundPage={marketingPageDetail}/>
        </Col>
      </Row>
      <HelpBlocks previewFundPage={marketingPageDetail}/>
    </PreviewContainer>
    <ContactInfo email={marketingPageDetail.fund_contact?.email} whiteBg={false}/>
    <Footer/>
  </>

};

export default FundMarketingPagePreview;
