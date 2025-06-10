import {FunctionComponent} from 'react';
import Dropdown from "react-bootstrap/Dropdown";
import DeleteOutline from "@material-ui/icons/DeleteOutline"
import MenuIcon from "@material-ui/icons/MoreVert";
import { eligibilityConfig } from "../../pages/EligibilityCriteria/components/EligibilityFormCreation/utils/EligibilityContext";
import {ICriteriaBlock} from "../../interfaces/EligibilityCriteria/criteria";
import {canDeleteBlock} from "../../pages/EligibilityCriteria/components/EligibilityFormCreation/utils/blockName";
import {useAppDispatch} from "../../app/hooks";
import {getFundCriteriaDetail} from "../../pages/EligibilityCriteria/thunks";
import {resetUserFilesText} from '../../pages/EligibilityCriteriaPreview/eligibilityCriteriaPreviewSlice'
import API from "../../api";
import {BlockActions as Wrapper} from "./styles";

interface IFormBlockProps {
  criteriaBlock: ICriteriaBlock;
  allowEdit?: boolean;
}

const FormBlock: FunctionComponent<IFormBlockProps> = ({criteriaBlock, allowEdit}) => {
  const dispatch = useAppDispatch()

  const handledeleteBlock = async () => {
    await API.deleteCriteriaBlock(criteriaBlock.id)
    if (criteriaBlock) {
      dispatch(getFundCriteriaDetail(criteriaBlock.criteria));
      dispatch(resetUserFilesText(criteriaBlock.id))
    }
  }

  return (
    <>
      {canDeleteBlock(criteriaBlock) && allowEdit && (
        <Wrapper className="action-btns">
          <Dropdown.Toggle>
            <MenuIcon />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={handledeleteBlock} className="delete-link">
              <DeleteOutline />
              Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        </Wrapper>
      )}
      
     </>   
    )
};

FormBlock.defaultProps = {
  allowEdit: true,
}

export default eligibilityConfig(FormBlock);
