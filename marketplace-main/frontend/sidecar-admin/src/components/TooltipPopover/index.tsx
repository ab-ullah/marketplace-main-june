import { Image, OverlayTrigger } from "react-bootstrap"
import { TooltipType } from "../../interfaces/company"
import { Description, Heading, ParentDiv, StyledTooltip } from "./styles"
import infoIconWhite from '../../assets/images/info-icon-white.svg';
import infoIconBlack from '../../assets/images/info-icon-black.svg';

const TooltipPopover = ({
    tooltip,
    isLight=false
}: {
    tooltip: TooltipType,
    isLight?: boolean
}) => {
   if(!tooltip) return null;
   return <OverlayTrigger
   placement="bottom"
   overlay={
     <StyledTooltip id="button-tooltip-2">
       <ParentDiv>
         <Heading>{tooltip.heading}</Heading>
         <Description>{tooltip.description}</Description>
       </ParentDiv>
     </StyledTooltip>
   }
 >
   {({ref, ...triggerHandler}) => (
     <span
       style={{marginLeft: '8px', marginRight: '2px'}}
       {...triggerHandler}
       className="align-items-center info-icon"
     >
       <Image
         ref={ref}
         roundedCircle
         src={isLight ? infoIconWhite : infoIconBlack}
         alt="info icon"
       />
     </span>
   )}
 </OverlayTrigger>
}

export default TooltipPopover