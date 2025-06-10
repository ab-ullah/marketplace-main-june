import React from "react";
import {
  Cont,
  Header,
  PillButtonCont,
  Body,
  DetailsTabsContainer,
  HeaderTitle,
  BtnsWrapper,
  StyledDropdown,
} from "./styles";
import { PillButton } from "../styles";
import { Tab, Tabs } from "react-bootstrap";
import SearchInput from "../SearchInput";
import InfoTileLayout, { ITileInfo } from "../InfoTileLayout";
import { isEmpty } from "lodash";

type SearchPackage = {
  searchQuery: string;
  setSearchQuery: any;
  searchPlaceholder: string;
};

type DetailsTabPackage = {
  currentTab: any;
  handleChangeTab: any;
  tabsConfig: any[];
};

type AdditionalButton = {
  color?: string;
  background?: string;
  borderColor?: string;
  title?: string;
  icon?: any;
  onClick?: any
  disabled?: boolean
}
// NOTE:-
// PARTIAL HERE MEANS THAT EITHER ALL THE ATTRIBUTES INCLUDED SHOULD BE PROVIDED OR NONE
// e.e In the "SearchPackage" above either all searchQuery, setSearchQuery and
// searchPlaceholder are provided in props or none

type StatsTableProps = Partial<SearchPackage> &
  Partial<DetailsTabPackage> & {
    title?: string;
    InfoTileData?: ITileInfo[];
    children?:any
    additionalButtons?: AdditionalButton[] | React.ReactNode[];
    btnBreakpoint?:string
    // Add additional props here
  };

const StatsTable = ({
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
  currentTab,
  handleChangeTab,
  tabsConfig,
  title,
  InfoTileData,
  children,
  additionalButtons,
  btnBreakpoint
}: StatsTableProps) => {
  const hasInfoTileData = InfoTileData && InfoTileData.length > 0;
  const currentTabComponent = tabsConfig?.find(
    (tabConfig) => currentTab === tabConfig.key
  )?.component;
const _additionalButtons = (additionalButtons || []).filter(btn=>!isEmpty(btn))
const calculatedBreakpoint = 840 + (tabsConfig ? 336 : 0) + 153*(_additionalButtons?.length || 0) + `px`
const breakPoint = btnBreakpoint || calculatedBreakpoint

  return (
    <Cont>
      <Header style={!currentTabComponent ? { borderBottom: "none" } : {}}>
        {!!title && <HeaderTitle>{title}</HeaderTitle>}
        {tabsConfig && (
          <DetailsTabsContainer>
            <Tabs
              id="stats-table"
              onSelect={handleChangeTab}
              activeKey={currentTab as string}
            >
              {tabsConfig.map((tabConfig) => (
                <Tab
                  key={tabConfig.key}
                  eventKey={tabConfig.key}
                  title={tabConfig.title}
                  className="create-form-tab"
                />
              ))}
            </Tabs>
          </DetailsTabsContainer>
        )}
        {setSearchQuery && (
          <SearchInput
            value={searchQuery}
            handleChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        )}
        {/* 
        You can use additional conditional props to render buttons, just add them in this
          component and render it conditionally with props, and also assign an onClick Handler
         */}

        {/* 
          840 was calculated as number at which it should break with two buttons but without
          tabs for which we add 336px to it if it exists
          
          */}
          {Boolean(_additionalButtons?.length) &&
          <>
        <StyledDropdown breakPoint={breakPoint}>
          <StyledDropdown.Toggle
            variant="success"
            id="dropdown-basic"
          ></StyledDropdown.Toggle>
          <StyledDropdown.Menu>
            <StyledDropdown.Item>
            </StyledDropdown.Item>
            {_additionalButtons?.map((btn: any) => {
              if(React.isValidElement(btn)) {
                return <StyledDropdown.Item>
                  {btn}
                </StyledDropdown.Item>
              }
              else {
                return <StyledDropdown.Item>
                <PillButton
                  color={btn?.color }
                  background={btn?.background}
                  style={{width:'inherit',justifyContent:'center'}}
                  onClick={btn?.onClick}
                  disabled={btn?.disabled}
                  borderColor={btn?.borderColor}
                >
                  {btn?.icon}
                  {btn?.title}
                </PillButton>
              </StyledDropdown.Item>
              }
              return null
            })}
          </StyledDropdown.Menu>
        </StyledDropdown>
        <BtnsWrapper breakPoint={breakPoint}>
        {_additionalButtons?.map((btn: any, i: number) => {
              if(React.isValidElement(btn)) {
                return <PillButtonCont last={_additionalButtons.length-1 === i}>
                  {btn}
                </PillButtonCont>
              }
              else {
                return <PillButtonCont last={_additionalButtons.length-1 === i}>
                <PillButton
                  color={btn?.color }
                  background={btn?.background}
                  style={{width:'inherit',justifyContent:'center'}}
                  onClick={btn?.onClick}
                  disabled={btn?.disabled}
                  borderColor={btn?.borderColor}
                >
                  {btn?.icon}
                  {btn?.title}
                </PillButton>
              </PillButtonCont>
              }
            })}
        </BtnsWrapper>
        </>}
      </Header>
      {hasInfoTileData && (
        <Body>
          <InfoTileLayout data={InfoTileData as ITileInfo[]} />
        </Body>
      )}
      {currentTabComponent && <Body>{currentTabComponent}</Body>}
      {children && <Body>{children}</Body>}

    </Cont>
  );
};

export default StatsTable;
