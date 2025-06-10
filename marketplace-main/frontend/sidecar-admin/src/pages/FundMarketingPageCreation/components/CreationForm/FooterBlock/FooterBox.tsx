import React, {FunctionComponent} from 'react';
import {IFooterBlock, IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import APISyncTextField from "../../../../../components/AutoSyncedInputs/TextInput";
import FundMarketingPageAPI from '../../../../../api/fundMarketingPageAPI/marketing_page_api';
import IconSelector from "./IconSelector";

interface FooterBoxProps {
  footerBlock: IFooterBlock,
  marketingPageDetail: IFundMarketingPageDetail
}


const FooterBox: FunctionComponent<FooterBoxProps> = ({footerBlock, marketingPageDetail}) => {
  const onChange = async (name: string, value: string | number) => {
    const payload = {[name]: value}
    await FundMarketingPageAPI.updateFooterBlock(
      marketingPageDetail.id,
      footerBlock.id,
      payload
    )
  }

  return <div className={'mb-5'}>

    <h4>Title</h4>
    <APISyncTextField
      name={'title'}
      placeholder="Description"
      onChange={(value: string) => onChange('title', value)}
      value={footerBlock.title}
    />

    <h4>URL</h4>
    <APISyncTextField
      name={'url'}
      placeholder="URL"
      onChange={(value: string) => onChange('url', value)}
      value={footerBlock.url}
    />

    <h4>Icon</h4>
    <IconSelector initialValue={footerBlock.icon_url?.id} handleUpdate={onChange} />

  </div>
};

export default FooterBox;
