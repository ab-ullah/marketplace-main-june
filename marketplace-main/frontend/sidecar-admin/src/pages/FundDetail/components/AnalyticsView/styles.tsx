import styled from 'styled-components'
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import { Tab as BSTab, Tabs as BSTabs, Button as BootstrapButton } from "react-bootstrap";

export const AnalyticsContainer = styled.div`
    padding: 0px 0px;
    width: 100vw;
    margin-left: -12px;
`

export const TabWithContent = ({ children, ...rest }: any) => {
    return <BSTab {...rest}>
        <TabContentContainer>{children}</TabContentContainer>
    </BSTab>
}

export const Tab = styled(BSTab)``;

export const TabsContainer = styled(BSTabs)`
    padding: 0px 80px;
    @media (max-width: 576px){
        padding: 0px 24px;
    }
    .nav-item {
      padding-left: 24px;
      padding-right: 24px;

      .nav-link {
        border: 0;
        color: ${props => props.theme.palette.eligibilityTheme.black};
        position: relative;
        z-index: 1;
        font-family: 'Quicksand Bold';
        font-size: 18px;
        letter-spacing: 0.02em;
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 18px;
        @media (max-width: 576px) {
            font-size: 14px;
        }

        &.active {
          color: ${props => props.theme.palette.eligibilityTheme.flatBlue};

          &:after {
            content: '';
            background: ${props => props.theme.palette.eligibilityTheme.flatBlue};
            height: 4px;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
          }
        }

        &:hover {
          color: ${props => props.theme.palette.eligibilityTheme.flatBlue};
        }
      }

      &:first-child {
        padding-left: 0px;
      }

      &:last-child {
        padding-right: 0;
      }
    }
`;

export const Section = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 32px;
`;


export const TabContentContainer = styled.div`
    padding: 32px 80px;
    background-color: #ECEFF1;
    @media (max-width: 991px) {
        padding: 0px 24px;
    }
`

export const Button = styled(BootstrapButton)`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #470C75;
    border-radius: 70px;
    color: #470C75;
    padding: 10px 30px;
    &:hover {
        .button-icon-svg{
            filter: brightness(0) invert(1);
        }
    }
`;

export const FilePresent = styled.div`
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDJINkM0LjkgMiA0IDIuOSA0IDRWMjBDNCAyMS4xIDQuOSAyMiA2IDIySDE4QzE5LjEgMjIgMjAgMjEuMSAyMCAyMFY3TDE1IDJaTTYgMjBWNEgxNFY4SDE4VjIwSDZaTTE2IDEwVjE1QzE2IDE3LjIxIDE0LjIxIDE5IDEyIDE5QzkuNzkgMTkgOCAxNy4yMSA4IDE1VjguNUM4IDcuMDMgOS4yNiA1Ljg2IDEwLjc2IDYuMDFDMTIuMDYgNi4xNCAxMyA3LjMzIDEzIDguNjRWMTVIMTFWOC41QzExIDguMjIgMTAuNzggOCAxMC41IDhDMTAuMjIgOCAxMCA4LjIyIDEwIDguNVYxNUMxMCAxNi4xIDEwLjkgMTcgMTIgMTdDMTMuMSAxNyAxNCAxNi4xIDE0IDE1VjEwSDE2WiIgZmlsbD0iIzQ3MEM3NSIvPgo8L3N2Zz4K");
    border: none;
    height: 24px;
    margin-right: 10px;
    margin-top: -2px;
    transition: all 0.2s ease-in-out;
    width: 24px;
`;

export const ExportCSVButton = ({ onClick }: any) => {
    return <Button onClick={onClick} variant="outline-primary"> <FilePresent className='button-icon-svg' />Export CSV</Button>
}

export const AnalyticsAndChartsContainer = styled(Section)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    @media (min-width: 1673px){
        max-width: 1600px;
    }
    @media (max-width: 1619px){
        flex-direction: column;
    }
`;

export const AnalyticsBlocksInner = styled.div`
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(474px, 1fr));
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    @media (max-width: 576px){
        grid-template-columns: repeat(auto-fit, minmax(auto, 474px));
    }
`;

export const AnalyticBlocksContainer = styled.div`
    padding: 20px;
    width: 100%;
    max-width: 1008px;
    order: 2;
    @media (max-width: 1619px){
        padding: 20px 0px;
        order: 3;
    }
`;

export const AnalyticsBlock = styled.div`
    align-items: flex-start;
    background-color: #FFFFFF;
    display: flex;
    flex-direction: column;
    height: 124px;
    justify-content: space-between;
    padding: 16px;
    h1{
        font-size: 40px;
        font-weight: 700;
        line-height: 60px;
    }
    h3{
        font-size: 18px;
        font-weight: 700;
        vertical-align: bottom;
    }
    h4{
        font-size: 16px;
        line-height: 24px;
        font-weight: 700;
    }
`;

export const AnalyticsBlockTitle = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
`;

export const HelpIcon = styled(HelpOutlineOutlinedIcon)`
    height: 15px !important;
    fill: #B0BEC5 !important;
    width: 15px !important;
`

export const AnalyticsTitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;


export const VerticalSection = styled(Section)`
    align-items: flex-start;
    flex-direction: column;
    @media (min-width: 1128px) and (max-width: 1619px){
        align-items: center;
    }
`;
