import React, {FunctionComponent, useState} from 'react';
import {BlockContainerDiv} from "../../../../presentational/BlockContainer";
import BlockItem from "./BlockItem";
import MarketingPageIcon from '../../../../assets/images/fundMarketingPage/marketing-page-icon.svg'
import InterestQuestionnaireIcon from '../../../../assets/images/fundMarketingPage/interest-questionaire-icon.svg'
import styled from "styled-components";
import FundMarketingAPI from '../../../../api/fundMarketingPageAPI/marketing_page_api';
import {useHistory} from "react-router-dom";
import {ADMIN_URL_PREFIX} from "../../../../constants/routes";
import {IFundBaseInfo} from "../../../../interfaces/fundDetails";
import {INTEREST_INDICATION_BLOCK, MARKETING_PAGE_BLOCK} from "./blockNames";
import Button from "react-bootstrap/Button";


interface BlocksListProps {
  closeModal: () => void;
  fund: IFundBaseInfo;
}


const MarketingPageBlockContainer = styled(BlockContainerDiv)`
  .add-block-card {
    width: 48%
  }

`


const BlocksList: FunctionComponent<BlocksListProps> = ({closeModal, fund}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const history = useHistory()

  const createFundMarketingPage = async () => {
    setSubmitting(true)
    if (selectedBlock !== MARKETING_PAGE_BLOCK) {
      setSubmitting(false)
      return
    }

    const payload = {fund: fund.id, description: '', title: '', sub_header: ''}
    const responseData = await FundMarketingAPI.createFundMarketingPage(payload)
    const marketingPageID = responseData.id;
    const url = `/${ADMIN_URL_PREFIX}/marketingPage/${marketingPageID}/edit`;
    history.push(url);
    closeModal()
  }

  return <>

    <MarketingPageBlockContainer>
      <BlockItem
        name={MARKETING_PAGE_BLOCK}
        icon={MarketingPageIcon}
        onClick={() => setSelectedBlock(MARKETING_PAGE_BLOCK)}
        isSelected={selectedBlock === MARKETING_PAGE_BLOCK}
      />
      <BlockItem
        name={INTEREST_INDICATION_BLOCK}
        icon={InterestQuestionnaireIcon}
        onClick={() => setSelectedBlock(INTEREST_INDICATION_BLOCK)}
        isSelected={selectedBlock === INTEREST_INDICATION_BLOCK}
      />
    </MarketingPageBlockContainer>
    <div className={'pt-3'}>
      <Button
        variant={'primary'}
        className={'float-end'}
        onClick={createFundMarketingPage}
        disabled={submitting}
      >
        Create
      </Button>
      <Button
        variant={'outline-primary'}
        className={'float-end'}
        onClick={closeModal}
      >
        Cancel
      </Button>
    </div>

  </>
};

export default BlocksList;
