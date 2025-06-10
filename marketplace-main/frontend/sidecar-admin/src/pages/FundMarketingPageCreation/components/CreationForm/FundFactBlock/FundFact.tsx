import React, {FunctionComponent} from 'react';
import {IFundFact, IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import APISyncTextField from "../../../../../components/AutoSyncedInputs/TextInput";
import FundMarketingPageAPI from '../../../../../api/fundMarketingPageAPI/marketing_page_api';

interface FundFactProps {
  fundFact: IFundFact,
  marketingPageDetail: IFundMarketingPageDetail
}


const FundFact: FunctionComponent<FundFactProps> = ({fundFact, marketingPageDetail}) => {
  const onChange = async (name: string, textValue: string) => {
    const payload = {[name]: textValue}
    await FundMarketingPageAPI.updateFundFact(
      marketingPageDetail.id,
      fundFact.id,
      payload
    )
  }

  return <div className={'mb-5'}>

    <h4>Title</h4>
    <APISyncTextField
      name={'description'}
      placeholder="Description"
      onChange={(value: string) => onChange('title', value)}
      value={fundFact.title}
    />

    <h4>Data</h4>
    <APISyncTextField
      name={'description'}
      placeholder="Description"
      onChange={(value: string) => onChange('data', value)}
      value={fundFact.data}
    />
  </div>
};

export default FundFact;
