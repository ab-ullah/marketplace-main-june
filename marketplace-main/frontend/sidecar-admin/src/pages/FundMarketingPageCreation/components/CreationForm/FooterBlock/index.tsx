import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import classNames from "classnames";
import FooterIcon from "../../../../../assets/images/fundMarketingPage/footer.svg"
import Button from "react-bootstrap/Button";
import styled from "styled-components";
import FooterBox from "./FooterBox";
import FundPageAPI from "../../../../../api/fundMarketingPageAPI/marketing_page_api";
import {useAppDispatch} from "../../../../../app/hooks";
import {fetchFundPageDetail} from "../../../thunks";

const AddButton = styled(Button)`
  width: 100%;
  text-align: center;
  margin-top: 20px;
`

interface FooterBlockProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const FooterBlock: FunctionComponent<FooterBlockProps> = ({marketingPageDetail}) => {
  const dispatch = useAppDispatch()

  const createFooterLink = async () => {
    const payload = {
      fund_marketing_page: marketingPageDetail.id
    }
    await FundPageAPI.createFooterBlock(marketingPageDetail.id, payload)
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  return <div className="create-form-card">
    <span className={classNames("block-tag", {'blue-background': true})}>
        {6}
      <img src={FooterIcon} alt="World icon" width={20} height={20}/>
        <span>Footer</span>
      </span>
    <h4 className={'mb-4'}>Footer boxes</h4>
    {marketingPageDetail.footer_blocks.map(footerBox => <FooterBox
      marketingPageDetail={marketingPageDetail}
      footerBlock={footerBox}
    />)}

    <AddButton variant={'outline-primary'} onClick={createFooterLink}>+ Add box</AddButton>
  </div>
};

export default FooterBlock;
