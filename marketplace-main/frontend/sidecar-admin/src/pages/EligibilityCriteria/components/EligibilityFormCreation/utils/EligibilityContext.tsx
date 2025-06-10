import React from "react";

const initContext = {
  allowEdit: true,
};

export const EligibilityContext = React.createContext(initContext);

export const getContextData = (isPublished: boolean) => {
  return {
    ...initContext,
    allowEdit: !isPublished,
  };
};

export const eligibilityConfig = (Content: any) => {
  const Component = (props: any) => {
    return (
      <EligibilityContext.Consumer>
        {(value: any) => <Content {...props} {...value} />}
      </EligibilityContext.Consumer>
    );
  };
  return Component;
};
