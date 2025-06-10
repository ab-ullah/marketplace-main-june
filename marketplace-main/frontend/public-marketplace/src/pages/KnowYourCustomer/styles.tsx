import { Button } from 'react-bootstrap'
import styled from 'styled-components'
import CurrencyFormat from 'react-currency-format'

export const BigTitle = styled.h1`
	color: #212121;
	font-size: 40px;
	font-family: 'Inter';
	font-weight: 700;
	margin: 0 auto;
	margin-bottom: 24px;
	max-width: 984px;
	padding-top: 40px;
	padding-left: 126px;
	transition: all 0.3s ease;
	width: 100%;
	@media screen and (max-width: 767px) {
		padding-left: 44px;
	}
	@media (max-width: 479px) {
		padding-left: 20px;
	}
	.suffix-text {
		align-self: end;
	}
`

export const ButtonRow = styled.div<{alightRight?: boolean}>`
display: flex;
justify-content: ${(props: any) => props.alightRight ? 'right' : 'space-between'};
padding: 0px 80px 0px 120px;
  .btn{
    margin-right: 16px;
    :last-child {
      margin-right: 0px;
    }
  }
`;

export const Container = styled.div`
	background-color: #eceff1;
	padding: 20px 40px;
	min-height: calc(100vh - 78px);
	@media screen and (max-width: 1199px) {
		padding: 20px;
	}
	@media (max-width: 655px) {
		min-height: calc(100vh - 64px);
	}
`

export const FieldContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	transition: width 0.2s ease;
`

export const FieldInner = styled.div`
	align-items: center;
	display: flex;
	flex-direction: row;
	margin-bottom: 10px;
	width: 100%;
`

export const FormContainer = styled.div`
	background-color: #fff;
	border-radius: 4px;
	max-width: 984px;
	margin: 0 auto;
	padding: 64px 126px;
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

		textarea {
			font-size: 15px;
			resize: none;
		}

		.select__value-container {
			font-size: 15px;
		}
	}

	.MuiDropzoneArea-root {
		border: 1px dashed #d5cbcb;
		min-height: unset;
		padding-bottom: 24px;
		padding-top: 24px;

		.MuiDropzoneArea-text {
			color: #2e86de;
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
`

export const NextButton = styled(Button)`
	background-color: ${props => props.theme.palette.primary} !important;
	border-radius: 70px;
	border-color: ${props => props.theme.palette.primary} !important;
	font-family: 'Quicksand Medium';
	padding: 10px 30px;
	transition: all 0.3s ease;

	:hover {
		background-color: ${props => props.theme.palette.primary} !important;
		border-color: ${props => props.theme.palette.primary} !important;
	}

	:disabled {
		background-color: #cfd8dc;
		border-color: #cfd8dc;
	}
`

export const Title = styled.h1`
	font-size: 32px;
	margin: 34px 0;
`

export const InnerFieldContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;

	.field-help-text {
	}
	&.disabled-div {
		pointer-events: none;
		cursor: not-allowed;
		div {
			cursor: not-allowed;
		}
	}
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
`

export const FileChooserButton = styled.div`
	background-color: transparent;
	border: 1px solid;
	border-color: ${props => props.theme.palette.primary};
	border-radius: 70px;
	color: ${props => props.theme.palette.primary};
	cursor: pointer;
	font-family: 'Quicksand Bold';
	margin-bottom: 16px;
	padding: 8px 18px;
	width: fit-content;
`

export const SelectButton = styled.div`
	border: 1px solid #2e86de;
	border-radius: 70px;
	color: #2e86de;
	font-family: 'Quicksand Bold';
	margin: 0 auto;
	padding: 8px 14px;
	user-select: none;
	width: fit-content;
`

export const CheckboxWrapper = styled.div`
	margin-top: 10px;
	padding-left: 0;
	input[type='checkbox'] {
		margin-right: 4px;
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
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export const SectionNote = styled(({ size, ...props }) => <div {...props} />)`
	padding-top: 10px;
	font-family: 'Quicksand Medium';
	display: flex;
	font-size: ${({ size }) =>
		size === 'large'
			? '26px'
			: size === 'medium' || !size
			? '18px'
			: '14px'};
`

export const AddAnotherButton = styled(props => (
	<Button variant='outline-secondary' {...props} />
))`
	border-radius: 70px;
	font-family: 'Quicksand Medium';
	padding: 10px 30px;
	transition: all 0.3s ease;
	border-color: ${props => props.theme.palette.primary} !important;
	color: ${props => props.theme.palette.primary} !important;
	:hover {
		background-color: ${props => props.theme.palette.primary} !important;
		border-color: ${props => props.theme.palette.primary} !important;
		color: #FFFFFF !important;
	}
	:disabled {
		border-color: #cfd8dc;
	}
`

export const BackButton = styled(({ disabled, onClick, ...props }) => (
	// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
	<div onClick={!disabled && onClick} {...props} />
))`
	align-items: center;
	border: 1px solid #ad62aa;
	border-radius: 70px;
	color: #ad62aa;
	cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
	display: flex;
	font-family: 'Quicksand Bold';
	padding: 8px 18px;
	user-select: none;
	width: fit-content;

	svg {
		fill: #ad62aa;
		height: 17px;
		margin-right: 4px;
		width: 17px;
	}
`

export const EligibilityErrorWrapper = styled.div`
	background-color: white;
	margin: 0 25%;
	padding: 10px 60px;
	.heading {
		margin: 25px 0;
	}
`

export const ParticipantDivider = styled.hr`
	:last-child {
		display: none;
	}
`

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const RadioButton = styled(({ checked, ...props }) => (
	<div {...props} />
))`
	align-items: center;
	background-color: ${({ checked, theme }) =>
		checked ? theme.palette.input.background : 'white'};
	border: 1px solid;
	border-radius: 15px;
	border-color: ${({ checked, theme }) =>
		checked ? theme.palette.input.border : '#ced4da'};
	color: black;
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
`

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const RadioInput = styled(({ checked, ...props }) => <div {...props} />)`
	align-items: center;
	background-color: ${({ checked, theme }) =>
		checked ? theme.palette.input.main : 'rgba(241, 241, 241, 0.89)'};
	border-radius: 50%;
	border-width: 1px;
	border-style: solid;
	border-color: ${({ checked }) => (checked ? '#FFF' : '#78909C')} !important;
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
`

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const RadioInner = styled(({ checked, ...props }) => <div {...props} />)`
	background-color: ${({ checked }) => (checked ? 'white' : 'transparent')};
	border-radius: 50%;
	height: 10px;
	transition: all 0.2s ease-in-out;
	width: 10px;
`

export const InvestmentAmountContainer = styled.div`
  .interest-form {
    padding: 0 !important;
    margin-top: 10px;
  }

  form {
    max-width: 100% !important;
  }

  .custom-radio-buttons {
    display: flex;

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
