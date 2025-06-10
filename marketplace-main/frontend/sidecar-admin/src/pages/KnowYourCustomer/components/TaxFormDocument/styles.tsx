import { Button } from 'react-bootstrap';
import styled from 'styled-components';

export const FileAlreadyAdded = styled.div`
  align-items: left;
  display: flex;
  flex-direction: row;
  font-family: 'Quicksand Medium';
  line-height: 24px;
  padding-bottom: 8px;
  svg{
    cursor: pointer;
  }
  span{
    overflow: hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
  }
`;

export const QuestionContainer = styled.div`
	align-items: center;
	display: flex;
	flex-direction: row;
	margin-bottom: 10px;
	justify-content: flex-start;
	width: 100%;
`;

export const QuestionFlag = styled(({ flagged, ...props }) => <div {...props} />)`
  background-image: url(${({ flagged }) => flagged ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjAwMTMgNS4wMDA2NUwxMS42NjggMy4zMzM5OEg0LjE2Nzk3VjE3LjUwMDdINS44MzQ2NFYxMS42NjczSDEwLjUwMTNMMTAuODM0NiAxMy4zMzRIMTYuNjY4VjUuMDAwNjVIMTIuMDAxM1oiIGZpbGw9IiM0NzBDNzUiLz4KPC9zdmc+Cg==' : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjMwMTMgNS4wMDA2NUwxMC42MzQ2IDYuNjY3MzJIMTUuMDAxM1YxMS42NjczSDEyLjIwMTNMMTEuODY4IDEwLjAwMDdINS44MzQ2NFY1LjAwMDY1SDEwLjMwMTNaTTExLjY2OCAzLjMzMzk4SDQuMTY3OTdWMTcuNTAwN0g1LjgzNDY0VjExLjY2NzNIMTAuNTAxM0wxMC44MzQ2IDEzLjMzNEgxNi42NjhWNS4wMDA2NUgxMi4wMDEzTDExLjY2OCAzLjMzMzk4WiIgZmlsbD0iIzQ3MEM3NSIvPgo8L3N2Zz4K'});
  cursor: pointer;
  height: 20px;
  margin-left: 28px;
  transition: background-image 0.2s ease-in-out;
  width: 20px;
  @media (max-width: 575px){
    margin-left: 4px;
  }
`;

export const CommentApproveButton = styled(Button)`
  font-size: 10px !important;
  padding: 5px 10px;
`

export const TaxDocumentName = styled.div`
	display: flex;
  margin-bottom: 5px;
`;

export const TaxDocumentLabelContainer = styled.div`
  display: flex;
  flex: 1;
	flex-direction: column;
`