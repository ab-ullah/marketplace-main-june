import styled from 'styled-components';
import BSButton from 'react-bootstrap/Button'
import Form from "react-bootstrap/Form";
import TH from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import selectedRadio from "../../assets/icons/selectedRadio.svg"
import { ThemeButton } from '../../components/Button/styles';

export const Container = styled.div`
  background-color: #ECEFF1;
  padding: 20px 40px;
  min-height: calc(100vh - 78px);
  @media screen and (max-width: 1199px){
    padding: 20px;
  }
  @media (max-width: 655px){
    min-height: calc(100vh - 64px);
  }
`;

// export const BackButton = styled(({disabled, onClick, ...props}) => <div onClick={!disabled && onClick} {...props} />)`
//   align-items: center;
//   background: #4A47A3;
//   border-radius: 70px;
//   color: white;
//   cursor: ${({disabled}) => disabled ? 'default' : 'pointer'};
//   display: flex;
//   font-family: 'Quicksand Bold';
//   padding: 16px 16px 16px 24px;
//   user-select: none;
//   width: fit-content;
//   float: left;
//   font-size: 1rem;

//   svg {
//     fill: white;
//     height: 17px;
//     margin-right: 4px;
//     width: 17px;
//   }
//   :hover {
//     background-color: #470C75;
//     border-color: #470C75;
//   }
// `;

export const BackButton = styled(ThemeButton)`
  align-items: center;
  background: #4A47A3;
  border-radius: 70px;
  color: white;
  cursor: ${({disabled}) => disabled ? 'default' : 'pointer'};
  display: flex;
  font-family: 'Quicksand Bold';
  padding: 16px 16px 16px 24px;
  user-select: none;
  width: fit-content;
  float: left;
  font-size: 1rem;

  svg {
    fill: white;
    height: 17px;
    margin-right: 4px;
    width: 17px;
  }
  :hover {
    background-color: #470C75;
    border-color: #470C75;
  }
`;

export const BigTitle = styled.h1`
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #212121;
  font-size: 40px;
  font-family: 'Inter';
  font-weight: 700;
  margin: 0 auto;
  margin-bottom: 24px;
  max-width: 984px;
  padding-top: 40px;
  transition: all 0.3s ease;
  width: 100%;
  @media screen and (max-width: 767px){
    padding-left: 44px;
  }
  @media (max-width: 479px){
    padding-left: 20px;;
  }
  .suffix-text {
    align-self: end;
  }
`;

export const FormContainer = styled.div`
  background-color: #fff;
  border-radius: 4px;
  max-width: 984px;
  margin: 0 auto;
  padding: 64px 126px;
  padding-bottom: 180px;
  transition: all 0.3s ease;
  @media screen and (max-width: 767px){
    padding: 44px;
  }
  @media (max-width: 479px){
    padding: 20px;
  }
  form{
    margin: 0 auto;
    max-width: 732px;
    width: 100%;
  }
  h3{
    font-size: 24px;
    margin-top: 12px;
    margin-bottom: 0px;
    :first-child{
      margin-top: 0px;
    }
  }
  .col-md-8{
    width: 100%;
    .row{
      margin-left: 0px;
    }
    input{
      font-size: 15px;
    }
    .select__value-container {
      font-size: 15px;
    }
  }
  .MuiDropzoneArea-root{
    border: 1px dashed #D5CBCB;
    min-height: unset;
    padding-bottom: 24px;
    padding-top: 24px;
    .MuiDropzoneArea-text{
      color:#2E86DE;
      font-family: 'Quicksand';
      font-size: 16px;
      font-weight: 500;
      margin: 0px;
      padding-bottom: 18px;
    }
  }
  .field-label{
    font-family: 'Quicksand Bold';
    width: 100%;
  }
  .form-check-inline{
    align-items: center;
    background: rgba(241, 241, 241, 0.89);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    margin-top: 4px;
    margin-bottom: 4px;
    padding: 12px;
    width: fit-content;
    transition: all 0.2s ease-in-out;
    .form-check-input {
      border: 1px solid #78909C;
    }
    input {
      cursor: pointer;
      height: 18px;
      margin: 0px;
      width: 18px;
    }
    label{
      cursor: pointer;
      padding-left: 8px;
    }
    &.selectedRadio {
      background: ${({ theme }) => theme.palette.primary} !important;
      color: #FFFFFF;

      .form-check-input {
        border-color: white;
      }
    }
  }
`;

export const NextButton = styled(ThemeButton)`
  background-color: #4A47A3;
  border-radius: 70px;
  border-color: #4A47A3;
  font-family: 'Quicksand bold';
  padding: 16px 16px 16px 24px;
  transition: all 0.3s ease;
  float: right;

  svg {
    height: 17px;
    width: 17px;
  }

  :hover {
    background-color: #470C75;
    border-color: #470C75;
  }

  :disabled {
    background-color: #CFD8DC;
    border-color: #CFD8DC;
  }
`;

export const Title = styled.h1`
  font-size: 32px;
  margin: 34px 0px;
`

export const StyledForm = styled(Form)`
  font-size: 15px;

  label {
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    line-height: 21px;
    color: #020203;
    margin-bottom: 5px;
    margin-top: 25px;
  }

  input {
    border: 1px solid #D5CBCB;
    box-sizing: border-box;
    border-radius: 8px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    color: #020203;
  }

  textarea {
    border: 1px solid #D5CBCB;
    box-sizing: border-box;
    border-radius: 8px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    color: #020203;
    height: 120px;

  }

  .error {
    color: red;
    font-size: 12px;
  }

  button {
    background-color: #4A47A3;
    float: right;
    padding: 16px 16px 16px 24px;
    font-family: Quicksand Bold;
    border-radius: 70px;
  }

  .create {
    background: #470C75;
    border-color: #470C75;
    color: #FFFFFF;
    margin-left: 20px;
  }

  .cancel {
    background: #FFFFFF;
    border-color: #470C75;
    color: #470C75;
  }
`

export const InnerFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  .field-help-text{
  }
`;

export const FakeLink: any = styled.span`
  cursor: ${(props: any) => props.disableLink ? 'not-allowed' : 'pointer'};
  color: blue;
  text-decoration: underline;
  &:hover {
    color: purple !important;
  }
`;

export const TableHead = styled(TH)`
  background-color: ${props => props.theme.palette.common.darkDesaturatedBlueColor}; 
  .MuiTableCell-head{
    color: white;
  }
`;

export const TableCellHeader = styled(TableCell)`
  font-family: 'Quicksand Bold' !important;
`;

export const TableCellBody = styled(TableCell)`
  font-family: 'Quicksand' !important;
`;

export const Checkbox = styled(Form.Check)`
.form-check-input:checked {
  background-color: ${({ theme }) => theme.palette.primary} !important;
}
  label {
    margin: 0;
  }  
`;

export const TaxForm = styled(Form)`
.selectedRadio {
  background:  ${({ theme }) => theme.palette.primary} !important;
  color: #FFFFFF !important;
  padding: 8px 12px !important;
  margin-top: 4px !important;

  label {
    line-height: 25px;
    color: #FFFFFF;
  }

  input {
    margin-left: 0;
    margin-top: 0;
    border: none !important;
    height: 1.15em;
  }

  .form-check-input {
    background-image: url(${selectedRadio});
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    background-color: ${({ theme }) => theme.palette.primary} !important;
  }
}
.form-check {
  .form-check-label {
    margin-top: 5px !important;
  }
}`

export const TaxEndDiv = styled.div`
  button {
    margin-top: 0 !important;
  }
  input {
    padding: 5px;
  }
`

export const ButtonWrapper = styled.div`
  margin-top: 40px;
  display:flex;
  justify-content: space-between;
`
export const ThemeCheckbox = styled.input`
accent-color: ${({ theme, checked }) => checked ? theme.palette.primary: 'unset'} !important; 
`
export const ThemeRadio =styled.input`
accent-color: ${({ theme, checked }) => checked ? theme.palette.primary: 'unset'} !important; 
`