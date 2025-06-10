import React, {FunctionComponent, useEffect, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import SubmitForReview from "../../../../components/SubmitForReview";
import FundMarketingAPI from "../../../../api/fundMarketingPageAPI/marketing_page_api";
import {ADMIN_URL_PREFIX} from "../../../../constants/routes";
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import {StyledPublishModal} from "./styles";


interface PublishModalProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const SubmitForReviewModal: FunctionComponent<PublishModalProps> = ({marketingPageDetail}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [reviewersData, setReviewersData] = useState<any>(null);

  const closeModal = () => setShowModal(false);

  const onSave = async (userIds: number[]) => {
    const payload = {
      users: userIds
    }
    await FundMarketingAPI.createFundPageReviewers(marketingPageDetail.id, payload)
    await fetchReviewers()
  }

  const onDelete = async (reviewerId: number) => {
    await FundMarketingAPI.deleteFundPageReviewers(marketingPageDetail.id, reviewerId)
    await fetchReviewers()
  }

  const fetchReviewers = async () => {
    const data = await FundMarketingAPI.getFundPageReviewers(marketingPageDetail.id)
    setReviewersData(data)
  }

  const urlToCopy = `${window.location.origin}/${ADMIN_URL_PREFIX}/marketingPage/${marketingPageDetail.id}/preview`

  useEffect(() => {
    fetchReviewers()
  }, [])

  if (!reviewersData) return <></>

  return <>
    <Button variant="primary float-end" onClick={() => setShowModal(true)}>Submit for Review</Button>
    <StyledPublishModal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Body>
        <SubmitForReview
          closeModal={closeModal}
          currentReviewers={reviewersData.reviewers}
          availableReviewers={reviewersData.available_reviewers}
          urlToCopy={urlToCopy}
          onDelete={onDelete}
          onSave={onSave}
        />
      </Modal.Body>
    </StyledPublishModal>
  </>;
};

export default SubmitForReviewModal;
