import styled from 'styled-components';
import BSButton from 'react-bootstrap/Button'
import {Badge as BSbadge} from 'react-bootstrap';
import CurrencyFormat from 'react-currency-format';
import { Link } from 'react-router-dom';
import { ThemeButton } from '../../components/Button/styles';
import Form from 'react-bootstrap/Form';

export const Container = styled.div`
  background-color: #ECEFF1;
  padding: 20px 40px;
  min-height: calc(100vh - 78px);
  @media screen and (max-width: 1199px) {
    padding: 20px;
  }
  @media (max-width: 655px) {
    min-height: calc(100vh - 64px);
  }
`;

export const Badge = styled(({status, ...props}) => <BSbadge {...props}>{status || 'N/A'}</BSbadge>)`
  background-color: ${({status}) => {
    switch (status) {
      case 'Draft':
        return '#B0BEC5';
      case 'Created':
        return '#E37628';
      case 'Submitted':
        return '#2E86DE';
      case 'Changes Requested':
        return '#9C1D1D';
      case 'Approved':
        return '#10AC84';
      default:
        return 'transparent';
    }
  }} !important;
  border-radius: 70px;
  color: ${({status}) => status ? '#fff' : '#90A4AE'} !important;
  font-size: 16px;
  padding: 4px 10px;
  transition: all 0.3s ease;
  width: fit-content;
`;

export const StatusBadge = styled(Badge)`
  background-color: ${({status}) => {
    switch (status) {
      case 'Draft':
        return '#E37628';
      case 'Syncing...':
        return '#B0BEC5';
      case 'Updated':
        return '#10AC84';
      default:
        return 'transparent';
    }
  }} !important;
  padding: 8px 10px;
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
  @media screen and (max-width: 767px) {
    padding-left: 44px;
  }
  @media (max-width: 479px) {
    padding-left: 20px;;
  }
  .suffix-text {
    align-self: end;
  }
`;

export const Button = styled(BSButton)`
  background-color: #470C75;
  border-radius: 70px;
  border-color: #470C75;
  padding: 16px 40px;

  :hover {
    background-color: #470C75;
  }
`;

export const ButtonRow = styled.div`
  display: block;
  .btn{
    margin-right: 16px;
    :last-child {
      margin-right: 0px;
    }
  }
`;

export const SmallButton = styled(Button)`
  padding: 4px 10px;
`;

export const FormContainer = styled.div`
  background-color: #fff;
  border-radius: 4px;
  max-width: 984px;
  margin: 0 auto;
  padding: 100px 126px;
  transition: all 0.3s ease;
  @media screen and (max-width: 767px) {
    padding: 44px;
  }
  @media (max-width: 479px) {
    padding: 20px;
  }

  form {
    margin: 0 auto;
    max-width: 732px;
    width: 100%;
  }

  h3 {
    font-size: 24px;
    margin-top: 12px;
    margin-bottom: 0;

    :first-child {
      margin-top: 0;
    }
  }

  .col-md-8 {
    width: 100%;

    .row {
      margin-left: 0;
    }

    input {
      font-size: 15px;
    }

    textarea{
      font-size: 15px;
      resize: none;
    }

    .select__value-container {
      font-size: 15px;
    }
  }

  .MuiDropzoneArea-root {
    border: 1px dashed #D5CBCB;
    min-height: unset;
    padding-bottom: 24px;
    padding-top: 24px;

    .MuiDropzoneArea-text {
      color: #2E86DE;
      font-family: 'Quicksand';
      font-size: 16px;
      font-weight: 500;
      margin: 0;
      padding-bottom: 18px;
    }
  }

  .field-label {
    font-family: 'Quicksand Bold';
    width: 100%;
  }
`;

export const RadioButton = styled(({ checked, ...props }) => <div {...props} />)`
  align-items: center;
  background-color: ${({ theme,checked }) => checked ? theme.palette.primary : 'rgba(241, 241, 241, 0.89)'};
  border-radius: 4px;
  color: ${({ checked }) => checked ? '#FFFFFF' : '#000'};
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-right: 16px;
  padding: 12px;
  width: fit-content;
  transition: all 0.2s ease-in-out;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  label {
    cursor: pointer;
    padding-left: 8px;
    user-select: none;
  }
`;

export const RadioInput = styled(({ checked, ...props }) => <div {...props} />)`
  align-items: center;
  background-color: ${({ theme,checked }) => checked ? theme.palette.primary : 'rgba(241, 241, 241, 0.89)'};
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ checked }) => checked ? '#FFF' : '#78909C'} !important;
  display: flex;
  cursor: pointer;
  height: 18px;
  justify-content: center;
  margin: 0;
  max-height: 18px;
  max-width: 18px;
  min-height: 18px;
  min-width: 18px;
  transition: all 0.2s ease-in-out;
  width: 18px;
`;

export const RadioInner = styled(({ checked, ...props }) => <div {...props} />)`
  background-color: ${({ checked }) => checked ? 'white' : 'transparent'};
  border-radius: 50%;
  height: 10px;
  transition: all 0.2s ease-in-out;
  width: 10px;
`;

export const NextButton = styled(ThemeButton)`
  background-color: #4A47A3;
  border-radius: 70px;
  border-color: #4A47A3;
  font-family: 'Quicksand Medium';
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


export const AddAnotherButton = styled(props => <ThemeButton var="outlined"  {...props} />)`
  border-radius: 70px;
  font-family: 'Quicksand Medium';
  padding: 10px 30px;
  transition: all 0.3s ease;
  border-color: #470C75;
  color: #470C75;
  float: right;
  margin-right: 10px !important;
  :hover{
    background-color: #470C75;
    border-color: #470C75;
  }
  :disabled{
    border-color: #CFD8DC;
  }
`;

export const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: width 0.2s ease;
`;

export const FieldInner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  width: 100%;
`;

export const Header = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 20px;

  h1 {
    margin: 0;
  }
`;

export const SelectButton = styled.div`
  border: 1px solid #2E86DE;
  border-radius: 70px;
  color: #2E86DE;
  font-family: 'Quicksand Bold';
  margin: 0 auto;
  padding: 8px 14px;
  user-select: none;
  width: fit-content;
`;


export const DisabledButton = styled.div`
  border: 1px solid gray ;
  border-radius: 70px;
  color: gray;
  font-family: 'Quicksand Bold';
  margin: 0 auto;
  padding: 8px 14px;
  user-select: none;
  width: fit-content;
`;


export const InnerFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .field-help-text {
  }
  &.disabled-div{
    pointer-events: none;
    cursor: not-allowed;
    div {
      cursor: not-allowed;
    }
  }
`;

export const Title = styled.h1`
  font-size: 39px;
  margin: 34px 0;
  line-height: 36px;
  font-weight: 500;
`

export const FileAlreadyAdded = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-family: 'Quicksand Medium';
  line-height: 24px;
  padding-bottom: 8px;

  svg {
    cursor: pointer;
  }

  span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

export const FileChooserButton = styled(ThemeButton)`
  border-radius: 70px;
  color: #470C75;
  cursor: pointer;
  font-family: 'Quicksand Bold';
  margin-bottom: 16px;
  padding: 8px 18px;
  width: fit-content;
`;


export const InvestmentAmountContainer = styled.div`
  .interest-form {
    padding: 0 !important;
    margin-top: 10px;
  }

  form {
    max-width: 100% !important;
  }
  
  input{
    padding: 8px !important;
  }

  .custom-radio-buttons {
    display: flex;

    .form-check-inline {
      padding: 8px !important;
      label {
        display: flex !important;
      }
      input {
        padding: 8px !important;
      }
    }

    .form-check {
      border-radius: 4px;
      padding: 10px 10px 10px 10px;
      min-width: 100px;
    }
    
    .form-check-input {
      border: none !important;
    }
  }
`

export const SectionNote = styled(({ size, ...props }) => <div {...props} />)`
  padding-top: 10px;
  font-family: 'Quicksand Medium';
  display: flex;
  font-size: ${({ size }) => size === 'large' ? '26px' : (size === 'medium' || !size) ? '18px' : '14px'};
`;

export const ParticipantDivider = styled.hr`
  :last-child{
    display: none;
  }
`;

export const CheckboxWrapper = styled.div`
    margin-top: 10px;
    padding-left: 0;
    input[type=checkbox]{
      margin-right: 4px; 
    }
`

export const  EligibilityErrorWrapper = styled.div`
background-color: white;
margin: 0 25%;
padding: 10px 60px;
.heading {
  margin: 25px 0;
}
`
export const CurrencyInput = styled(CurrencyFormat)`
  padding: 6px 14px;
  background: #ffffff;
  border: 1px solid #cfd8dc;
  box-sizing: border-box;
  border-radius: 8px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: #020203;
  width: 100%;
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  line-height: 15px;
  color: #4A47A3;
`

export const ThemeCheckboxSection = styled(Form.Check)`
.form-check-input:checked{
  background-color: ${({ theme }) =>  theme.palette.primary} !important;  
}
`