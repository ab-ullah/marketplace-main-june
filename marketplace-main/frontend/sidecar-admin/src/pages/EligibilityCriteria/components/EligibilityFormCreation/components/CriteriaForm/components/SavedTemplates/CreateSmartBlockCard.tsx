import React, { FunctionComponent } from "react";
import docIcon from '../../../../../../../../assets/images/doc-icon.svg'

interface ICreateCustomSmartBlockCardProps {
    onCreateCustomSmartBlock: () => void;
}

const CreateCustomSmartBlockCard: FunctionComponent<ICreateCustomSmartBlockCardProps> = ({
    onCreateCustomSmartBlock
}) => {

  return (
    <div
    className="add-block-card d-flex w-100 mb-3 mr-2"
    >
      <div
        onClick={onCreateCustomSmartBlock}
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
        <p>Create Custom Smart Block</p>
      </div>
    </div>
  );
};

export default CreateCustomSmartBlockCard;
