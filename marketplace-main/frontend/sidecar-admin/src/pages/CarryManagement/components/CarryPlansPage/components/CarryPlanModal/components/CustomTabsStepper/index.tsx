import { StepPill, Tab, TabTitle, TabsContainer } from "./styles";

const CustomTabsStepper = ({ tabs, activeTab, handleChange }: any) => {
  const isActive = (key: string) => {
    if (activeTab) {
      return activeTab === key;
    } else return tabs[0].key === key;
  };

  const handleTabClick = (key: string) => {
    if (handleChange) {
      handleChange(key);
    }
  };

  return (
    <TabsContainer>
      {tabs.map((elem: any, index: any) => (
        <Tab active={isActive(elem.key)} onClick={()=>handleTabClick(elem.key)}>
          <StepPill>Step {index + 1}</StepPill>
          <TabTitle>{elem.title}</TabTitle>
        </Tab>
      ))}
    </TabsContainer>
  );
};

export default CustomTabsStepper;
