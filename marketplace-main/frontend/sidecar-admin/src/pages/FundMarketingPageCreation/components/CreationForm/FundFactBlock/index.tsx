import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import classNames from "classnames";
import MainBlockIcon from "../../../../../assets/images/fundMarketingPage/main-page.svg"
import Button from "react-bootstrap/Button";
import styled from "styled-components";
import FundFact from "./FundFact";
import FundPageAPI from "../../../../../api/fundMarketingPageAPI/marketing_page_api";
import {useAppDispatch} from "../../../../../app/hooks";
import {fetchFundPageDetail} from "../../../thunks";

const AddButton = styled(Button)`
  width: 100%;
  text-align: center;
  margin-top: 20px;
`

interface FundFactBlockProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const FundFactBlock: FunctionComponent<FundFactBlockProps> = ({marketingPageDetail}) => {
  const dispatch = useAppDispatch()

  const createFundFact = async () => {
    const payload = {
      fund_marketing_page: marketingPageDetail.id,
      title: '',
      data: ''
    }
    await FundPageAPI.createFundFact(marketingPageDetail.id, payload)
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  return <div className="create-form-card">
    <span className={classNames("block-tag", {'blue-background': true})}>
        {2}
      <img src={MainBlockIcon} alt="World icon" width={20} height={20}/>
        <span>Fund Facts</span>
      </span>
    <h4 className={'mb-4'}>Enter fund facts</h4>
    {marketingPageDetail.fund_facts.map(fundFact => <FundFact
      marketingPageDetail={marketingPageDetail}
      fundFact={fundFact}
    />)}

    <AddButton variant={'outline-primary'} onClick={createFundFact}>+ Add Fact</AddButton>
  </div>
};

export default FundFactBlock;
