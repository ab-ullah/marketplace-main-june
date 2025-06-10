import React, {FunctionComponent, useState} from 'react';

import classNames from "classnames";
import 'react-toastify/dist/ReactToastify.min.css';

interface BlocksItemProps {
  name: string;
  icon: string;
  onClick: () => void;
  isSelected: boolean
}


const BlockItem: FunctionComponent<BlocksItemProps> = ({name, icon, onClick, isSelected}) => {
  const [disabled, setDisabled] = useState(false);

  const onClickHandler = async () => {
    if (disabled) return;
    setDisabled(true);
    onClick()
    setDisabled(false);
  }
  return <div onClick={onClickHandler}
              className={classNames('add-block-card mb-3', {
                'bg-gray': !isSelected && disabled,
                'dark-blue': isSelected
              })}>
    <div className={'img-div'}><img src={icon} width={24} height={24}/></div>
    <p>{name}</p>
    {/*<span>{block.description}</span>*/}

  </div>
};

export default BlockItem;
