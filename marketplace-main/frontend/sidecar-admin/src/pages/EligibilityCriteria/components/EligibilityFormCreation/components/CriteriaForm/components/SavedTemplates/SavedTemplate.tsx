import React, { FunctionComponent, useState } from "react";
import classNames from "classnames";
import API from '../../../../../../../../api/backendApi';
import docIcon from '../../../../../../../../assets/images/doc-icon.svg'
import "react-toastify/dist/ReactToastify.min.css";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../../../../../../../app/hooks";
import { fetchSmartBlockTemplates, getFundCriteriaDetail } from "../../../../../../thunks";
import TemplateActionMenu from "./ActionMenu";
import { setSelectedTemplate } from "../../../../../../eligibilityCriteriaSlice";
import { toast } from "react-toastify";
import DeletionConfirmationModal from "./ConfirmationModal";

interface ISavedTemplateProps {
  isSelectedTemplate: boolean;
  template: any;
  callbackEditTemplate: () => void;
}

const SavedTemplate: FunctionComponent<ISavedTemplateProps> = ({
    template,
  isSelectedTemplate,
  callbackEditTemplate
}) => {
    const {criteriaId} = useParams<{ criteriaId: string | undefined }>();
    const [showDeleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const dispatch = useAppDispatch();

 const onSelectTemplate = async () => {
    if(criteriaId && template.id){
        await API.createCustomBlockFromTemplate(Number(criteriaId), template.id);
        dispatch(getFundCriteriaDetail(Number(criteriaId)));
        toast("Block Added to Form");
    }
 }

 const onDeleteTemplate = async () => {
    if(template.id){
        await API.deleteTemplate(template.id);
        hideDeleteModal();
        dispatch(fetchSmartBlockTemplates());
    }
 }

 const showDeleteModal = () => {
  setDeleteConfirmationModal(true)
 }

 const hideDeleteModal = () => {
  setDeleteConfirmationModal(false)
 }

  return (
    <div
    className={classNames("add-block-card d-flex w-100 mb-3 mr-2", {
        "bg-gray": isSelectedTemplate,
      })}
    >
      <div
        onClick={() => {!isSelectedTemplate && onSelectTemplate()}}
        className="w-100"
      >
        <div className={"img-div"}>
          <img
            src={docIcon}
            width={24}
            height={24}
            alt="block-icon"
          />
        </div>
        <p className="line-clamp1">{template.title}</p>
      </div>
      <TemplateActionMenu 
       onEditTemplate={() => {
            dispatch(setSelectedTemplate(template));
            callbackEditTemplate();
        }} 
        onDeleteTemplate={showDeleteModal}
        />
        <DeletionConfirmationModal 
          show={showDeleteConfirmationModal}
          hideDeleteModal={hideDeleteModal}
          onDeleteTemplate={onDeleteTemplate}
        />
    </div>
  );
};

export default SavedTemplate;
