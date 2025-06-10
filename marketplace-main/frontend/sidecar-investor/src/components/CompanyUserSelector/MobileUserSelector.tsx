import React, {FunctionComponent} from 'react';
import {OptionTypeBase} from "react-select";
import useScreenWidth from "../../hooks/useScreenWidth";
import CompanyUserSelector from "./index";
import {useAppSelector} from "../../app/hooks";
import {selectUserInfo} from "../../pages/User/selectors";
import UnpublishedToggle from "../ViewAsPublishedToggle";

interface CompanyUserSelectorProps {
  onChange: any;
  viewAs: OptionTypeBase | null | undefined;
  showUnPublished: boolean;
  setShowUnPublished: (args0: boolean) => void
}


const MobileUserSelector: FunctionComponent<CompanyUserSelectorProps> = ({
                                                                           onChange,
                                                                           viewAs,
                                                                           showUnPublished,
                                                                           setShowUnPublished
                                                                         }) => {
  const userInfo = useAppSelector(selectUserInfo);
  const {isSmall} = useScreenWidth();

  if (!isSmall || !userInfo || !userInfo.is_sidecar_admin) return <></>
  return <>
    <CompanyUserSelector onChange={onChange} value={viewAs}/>
    {viewAs && <div className={'ps-2'}>
      <UnpublishedToggle showUnpublished={showUnPublished} onChange={setShowUnPublished}/>
    </div>}
  </>
}

export default MobileUserSelector;
