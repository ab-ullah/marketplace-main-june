import Tooltip from "@material-ui/core/Tooltip";

const TooltipWrapper = ({ enable, children, text }: any) => {
    if (enable)
      return (
        <Tooltip title={text} arrow>
          <span>{children}</span>
        </Tooltip>
      );
  
    return children;
  };
  
  export default TooltipWrapper;