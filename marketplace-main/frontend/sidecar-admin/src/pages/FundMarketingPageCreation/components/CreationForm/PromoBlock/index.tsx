import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../../interfaces/FundMarketingPage/fundMarketingPage";
import FundMarketingPageAPI from '../../../../../api/fundMarketingPageAPI/marketing_page_api';
import classNames from "classnames";
import documentIcon from "../../../../../assets/images/fundMarketingPage/documents.svg"
import DocumentDropZone from "../../../../../components/FileUpload";
import {useAppDispatch} from "../../../../../app/hooks";
import {fetchFundPageDetail} from "../../../thunks";
import ImageIcon from "../../../../../components/ImageIcon";
import {IMAGE_TYPE, VIDEO_TYPE} from "../../../../../constants/promoFileTypes";

interface PromoFileBlockProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const PromoFileBlock: FunctionComponent<PromoFileBlockProps> = ({marketingPageDetail}) => {
  const dispatch = useAppDispatch()

  const getFileType = (fileType: string) => {
    if (fileType.toLowerCase().startsWith('image')) return `${IMAGE_TYPE}`
    if (fileType.toLowerCase().startsWith('video')) return `${VIDEO_TYPE}`
    return ''
  }

  const onFileUpload = async (fileData: any) => {
    console.log("FD", fileData)
    const formData = new FormData();
    formData.append('promo_file', fileData);
    formData.append('fund_marketing_page', marketingPageDetail.id.toString());
    formData.append('file_type', getFileType(fileData.type));
    await FundMarketingPageAPI.createPromoFile(
      marketingPageDetail.id,
      formData
    )
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }

  const onDeletePromoFile = async (promoFileId: number) => {
    await FundMarketingPageAPI.deletePromoFile(marketingPageDetail.id, promoFileId)
    dispatch(fetchFundPageDetail(marketingPageDetail.id))
  }


  return <div className="create-form-card">
    <span className={classNames("block-tag", {'blue-background': true})}>
        {3}
      <img src={documentIcon} alt="World icon" width={20} height={20}/>
        <span>Promo video/image</span>
      </span>
    <h4>Upload Promo Materials</h4>
    <div>
      {marketingPageDetail.fund_page_promo_files.map((promoFile) => <ImageIcon
          url={promoFile.promo_file}
          onDelete={() => onDeletePromoFile(promoFile.id)}
        />
      )}
    </div>
    <DocumentDropZone
      onFileSelect={(file: any) => onFileUpload(file)}
    />
  </div>


};

export default PromoFileBlock;
