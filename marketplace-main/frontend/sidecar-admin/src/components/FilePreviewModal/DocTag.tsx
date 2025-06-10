import { FunctionComponent } from "react";
import truncate from "lodash/truncate";
import DeleteIcon from "../../assets/images/delete-icon.svg";
import {ButtonWrapper} from "./styles";

interface IDocTagProps {
  documentName: string;
  handleDelete?: () => void;
  disabled?:boolean
}

const DocTag: FunctionComponent<IDocTagProps> = ({
  documentName,
  handleDelete,
  disabled,
  children,
}) => {

  const onDelete = (e: any) => {
    e.stopPropagation();
    if (handleDelete && !disabled) handleDelete();
  };

  const docName = truncate(documentName, { length: 40 });

  return (
    <>
      <ButtonWrapper>
        <div className="file-tag">
          {children || <span className="doc-name">{docName}</span>}
        </div>
        {handleDelete && (
          <img src={DeleteIcon} onClick={onDelete} alt="Delete" title="Delete" style={disabled?{opacity:'0.5',cursor:'not-allowed'}:{}} />
        )}
      </ButtonWrapper>

    </>
  );
};

export default DocTag;
