import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import APISyncTextField from "../../../../../components/AutoSyncedInputs/TextInput";
import FundMarketingPageAPI from '../../../../../api/fundMarketingPageAPI/marketing_page_api';
import classNames from "classnames";
import MainBlockIcon from "../../../../../assets/images/fundMarketingPage/main-page.svg"

interface ContactBlockProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const ContactBlock: FunctionComponent<ContactBlockProps> = ({marketingPageDetail}) => {
  const onChange = async (name: string, textValue: string) => {
    const payload = {[name]: textValue}
    await FundMarketingPageAPI.updateContact(
      marketingPageDetail.id,
      marketingPageDetail.fund_contact.id,
      payload
    )
  }

  if (!marketingPageDetail.fund_contact) return <></>

  return <div className="create-form-card">
    <span className={classNames("block-tag", {'blue-background': true})}>
        {7}
      <img src={MainBlockIcon} alt="World icon" width={20} height={20}/>
        <span>Contact</span>
      </span>

    <h4 className={'mt-1'}>Support Email</h4>
    <APISyncTextField
      name={'email'}
      placeholder="Contact Email"
      onChange={(value: string) => onChange('email', value)}
      value={marketingPageDetail.fund_contact.email}
    />
  </div>


};

export default ContactBlock;
