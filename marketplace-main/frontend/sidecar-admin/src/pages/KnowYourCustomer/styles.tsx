import styled from "styled-components";
import { Button as BSButton } from "react-bootstrap";
import Col from "react-bootstrap/Col";

export const Container = styled.div`
  background-color: #ECEFF1;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  @media (max-width: 655px){
    min-height: calc(100vh - 64px);
  }
`;

export const Header = styled.div`
  align-items: center;
  background-color: white;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 80px 0px;
  transition: all 0.2s ease-in-out;
  width: 100%;
  z-index: 10;
  h1{
    margin: 0px;
  }
  @media screen and (max-width: 991px){
    padding-left: 20px;
    padding-right: 20px;
  }
`;

export const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
`;

export const HeaderPath = styled.span`
  color: #90A4AE;
  font-size: 14px;
  a{
    color: #90A4AE;
  }
`;

export const Tab = styled(({ active, ...props }) => <div {...props} />)`
  border-bottom: 4px solid transparent;
  border-bottom-color: ${({ active }) => active ? '#2E86DE' : 'transparent'};
  cursor: pointer;
  font-family: 'Quicksand Medium';
  padding-bottom: 12px;
  margin-right: 48px;
  transition: all 0.2s ease-in-out;
  :last-child{
    margin-right: 0px;
  }
  @media (max-width: 767px){
    margin-right: 20px;
  }
`;

export const TabRow = styled.div`
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

export const ButtonRow = styled.div`
  align-items: center;
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;
  padding-bottom: 26px;
  .btn{
    border-radius: 70px;
    font-family: 'Quicksand Medium' !important;
    margin-right: 16px;
    padding: 10px 30px;
    @media (max-width: 767px){
      padding: 10px;
    }
    &:last-child{
      margin-right: 0px;
    } 
  }
`;

export const ApproveButton = styled(BSButton)`
  background-color: #470C75;
  border-color: #470C75;
`;

export const DeclineButton = styled(props => <BSButton {...props} variant="outline-danger" />)`
`;

export const EditButton = styled(props => <BSButton {...props} variant="outline-primary" />)`
  border-color: #470C75;
  color: #470C75;
`;

export const NavContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  span{
    color: #90A4AE;
    font-size: 14px;
    padding: 0px 8px;
  }
`;

export const NavButton = styled(({ disabled, ...props }) => <div {...props} />)`
  align-items: center;
  border: 1px solid #B0BEC5;
  border-radius: 50%;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  display: flex;
  height: 43px;
  justify-content: center;
  width: 43px;
  .MuiSvgIcon-root {
    fill: #2E86DE;
  }
`;

export const InternalCardContainer = styled.div`
	width: 100%;
	border-top: 1px #470C75 solid;
	padding-top: 30px;
`;


export const CardContainer = styled.div`
	width: 100%;
`;

export const Inner = styled(Col)`
	padding: 40px 80px 40px;
  transition: padding 0.2s ease-in-out;
	@media (max-width: 991px){
			padding: 40px 24px 40px;
	}
`;

export const RiskValueCol = styled(Col)`
  padding: 5px 0 10px;
`

export const CommentsContainer = styled(Col)`
  background-color: #ffffff;
  
  .comments-box {
    top: 10px
  }
`

export const BigTitle = styled.h1`
  color: #212121;
  font-size: 40px;
  font-family: 'Inter';
  font-weight: 700;
  margin: 0 auto;
  transition: all 0.3s ease;
  &>span {
    position: relative;
    bottom: 8px;
    left: 10px;
  }
`;

export const Title = styled.h1``;

export const CardTitle = styled.h3``;

export const QuestionContainer = styled.div`
	align-items: center;
	display: flex;
	flex-direction: row;
	margin-bottom: 10px;
	justify-content: flex-start;
	width: 100%;
`;

export const QuestionLabel = styled.span`
  font-family: 'Quicksand Medium';
`;

export const QuestionInner = styled.div`
	align-items: center;
	display: flex;
  flex: 1;
	flex-direction: row;
	justify-content: flex-start;
  word-break: break-word;
  align-self: start;
`;

export const QuestionFileTag = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  @media (max-width: 767px){
    width: 100%;
  }
  svg{
    cursor: pointer;
    margin-right: 19px;
  }
  span{
    font-family: 'Quicksand';
    overflow: hidden;
    word-break: break-word;
    text-overflow:ellipsis;
  }
`;

export const QuestionFlag = styled(({ flagged, inlineFlag, ...props }) => <span {...props} />)`
  background-image: url(${({ flagged }) => flagged ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjAwMTMgNS4wMDA2NUwxMS42NjggMy4zMzM5OEg0LjE2Nzk3VjE3LjUwMDdINS44MzQ2NFYxMS42NjczSDEwLjUwMTNMMTAuODM0NiAxMy4zMzRIMTYuNjY4VjUuMDAwNjVIMTIuMDAxM1oiIGZpbGw9IiM0NzBDNzUiLz4KPC9zdmc+Cg==' : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjMwMTMgNS4wMDA2NUwxMC42MzQ2IDYuNjY3MzJIMTUuMDAxM1YxMS42NjczSDEyLjIwMTNMMTEuODY4IDEwLjAwMDdINS44MzQ2NFY1LjAwMDY1SDEwLjMwMTNaTTExLjY2OCAzLjMzMzk4SDQuMTY3OTdWMTcuNTAwN0g1LjgzNDY0VjExLjY2NzNIMTAuNTAxM0wxMC44MzQ2IDEzLjMzNEgxNi42NjhWNS4wMDA2NUgxMi4wMDEzTDExLjY2OCAzLjMzMzk4WiIgZmlsbD0iIzQ3MEM3NSIvPgo8L3N2Zz4K'});
  cursor: ${({ onClick }) => onClick ? 'pointer' : 'default'};
  height: 20px;
  margin-left: 8px;
  transition: background-image 0.2s ease-in-out;
  width: 20px;
  ${({inlineFlag}) => inlineFlag && `
    margin-left: 8px;
    display: inline-block;
    position: relative;
    top: 4px;
  `}
  @media (max-width: 575px){
    margin-left: 4px;
  }
`;

export const FileFlagWrapper = styled.div`
  display: inline-block;
`

export const SchemaContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 24px;
  width: 100%;
`;

export const EligibilityAnswerDiv = styled.div`
  display: inline-block;
  div {
    display: flex;
  }
  .flag {
    position: relative;
  }
  `

export const CommentBadge = styled.div`
  background-color: ${props => props.color ? props.color:'#E37628'};
  border-radius: 27px;
  color: white;
  font-family: 'Quicksand Medium';
  padding: 4px 15px;
  width: fit-content;
  font-weight: 700;
`;

export const RequestContent = styled.div`
	align-items: flex-start;;
	display: flex;
  flex: 1;
	flex-direction: column;
	justify-content: flex-start;
`;

export const FileAlreadyAdded = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-family: 'Quicksand Medium';
  line-height: 24px;
  padding-bottom: 8px;
`;
export const EligibilityDocuments = styled.div`
  display: flex !important;
  flex-direction: column;
  div {
    display: inline-block;
  }
  .flag {
    position: relative;
    top: 4px;
  }
  `
export const FlagAndBadgeWrapper = styled.div`
	align-items: flex-start;;
	display: flex;
  flex: 1;
	flex-direction: row;
	justify-content: flex-start;
`;

export const FakeLink: any = styled.span`
  cursor: ${(props: any) => props.disableLink ? 'not-allowed' : 'pointer'};
  color: blue;
  text-decoration: underline;
  &:hover {
    color: purple !important;
  }
`;

export const RepliesWrapper = styled.div`
  background-color: ${props => props.color ? props.color : 'cornflowerblue'};
  padding: 2px 10px;
  border-radius: 10px;
  white-space: break-spaces;
  color: white;
  margin-top: 10px;
}
  div {
    display: flex;
    justify-content: space-between;
  }
  h5 {
    font-size: 16px;
    color: white;
  }
  p {
    font-size: 14px;
    color: white;
  }
`

export const ReplyField = styled.input`
  padding: 0.275rem 0.75rem;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 0.25rem;
`

export const TextAreaWrapper = styled.div`
  display: flex !important;
  flex-direction: column;
`

export const ReplyButton = styled(BSButton)`
  font-size: 10px !important;
  padding: 5px 10px;
  width: 65px;
  margin: 5px 0px !important;
`

export const ReplySectionWrapper = styled.div`
  margin-left: 50%;
`

export const RepliesContainer = styled.div`
  display: flex !important;
  flex-direction: column;
  background-color: #FCF1EA;
  padding: 10px;
`
