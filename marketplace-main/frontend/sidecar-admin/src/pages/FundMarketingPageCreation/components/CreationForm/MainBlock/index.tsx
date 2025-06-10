import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import APISyncTextField from "../../../../../components/AutoSyncedInputs/TextInput";
import FundMarketingPageAPI from '../../../../../api/fundMarketingPageAPI/marketing_page_api';
import classNames from "classnames";
import MainBlockIcon from "../../../../../assets/images/fundMarketingPage/main-page.svg"
import DocumentDropZone from "../../../../../components/FileUpload";
import {useAppDispatch} from "../../../../../app/hooks";
import {fetchFundPageDetail} from "../../../thunks";
import ImageIcon from "../../../../../components/ImageIcon";

interface MainBlockProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const MainBlock: FunctionComponent<MainBlockProps> = ({marketingPageDetail}) => {
  const dispatch = useAppDispatch()
  const onChange = async (name: string, textValue: string) => {
    const payload = {[name]: textValue}
    await FundMarketingPageAPI.updateFundMarketingPage(
      marketingPageDetail.id,
      payload
    )
  }

  const onImageUpload = async (fieldName: string, fileData: any) => {
    const formData = new FormData();
    formData.append(fieldName, fileData);
    await FundMarketingPageAPI.updateFundMarketingPage(
      marketingPageDetail.id,
      formData
    )
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  const deleteImage = async (fieldName: string) => {
    const payload = {[fieldName]: null}
    await FundMarketingPageAPI.updateFundMarketingPage(
      marketingPageDetail.id,
      payload
    )
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  return <div className="create-form-card">
    <span className={classNames("block-tag", {'blue-background': true})}>
        {1}
      <img src={MainBlockIcon} alt="World icon" width={20} height={20}/>
        <span>Main Page</span>
      </span>
    <h4>Upload logo</h4>
    <DocumentDropZone
      onFileSelect={(file: any) => onImageUpload('logo', file)}
      singleFileOnly={true}
    />
    {marketingPageDetail.logo && <ImageIcon
      url={marketingPageDetail.logo}
      onDelete={() => {
        deleteImage('logo')
      }}
    />}

    <h4 className={'mt-5'}>Page Title</h4>
    <APISyncTextField
      name={'pageTitle'}
      placeholder="Page Title"
      onChange={(value: string) => onChange('title', value)}
      value={marketingPageDetail.title}
    />

    <h4>Sub-header</h4>
    <APISyncTextField
      name={'subHeader'}
      placeholder="Sub-header"
      onChange={(value: string) => onChange('sub_header', value)}
      value={marketingPageDetail.sub_header}
      isTextArea={true}
      rows={3}
    />

    <h4>Description</h4>
    <APISyncTextField
      name={'description'}
      placeholder="Description"
      onChange={(value: string) => onChange('description', value)}
      value={marketingPageDetail.description}
      isTextArea={true}
      rows={8}
    />
    <h4>Background Image</h4>
    <DocumentDropZone
      onFileSelect={(file: any) => onImageUpload('background_image', file)}
      singleFileOnly={true}
    />
    {marketingPageDetail.background_image && <ImageIcon
      url={marketingPageDetail.background_image}
      onDelete={() => {
        deleteImage('background_image')
      }}
    />}
  </div>


};

export default MainBlock;
