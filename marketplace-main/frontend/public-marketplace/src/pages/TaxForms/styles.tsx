/* eslint-disable @typescript-eslint/no-explicit-any  */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import styled from 'styled-components'
import BSButton from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import TH from '@material-ui/core/TableHead'
import TableCell from '@material-ui/core/TableCell'
import selectedRadio from '../../assets/icons/selectedRadio.svg'

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

// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
export const BackButton = styled(({ disabled, onClick, ...props }) => (
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

export const FormContainer = styled.div`
	background-color: #fff;
	border-radius: 4px;
	max-width: 984px;
	margin: 0 auto;
	padding: 64px 126px;
	padding-bottom: 180px;
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
		margin-bottom: 0px;
		:first-child {
			margin-top: 0px;
		}
	}
	.col-md-8 {
		width: 100%;
		.row {
			margin-left: 0px;
		}
		input {
			font-size: 15px;
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
			margin: 0px;
			padding-bottom: 18px;
		}
	}
	.field-label {
		font-family: 'Quicksand Bold';
		width: 100%;
	}
	.form-check-inline {
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
			border: 1px solid #78909c;
		}
		input {
			cursor: pointer;
			height: 18px;
			margin: 0px;
			width: 18px;
		}
		label {
			cursor: pointer;
			padding-left: 8px;
		}
		&.selectedRadio {
			background: #2e86de;
			color: #ffffff;

			.form-check-input {
				border-color: white;
			}
		}
	}
`

export const NextButton = styled(BSButton)`
	background-color: ${props => props.theme.palette.primary} !important;
	border-radius: 70px;
	border-color: ${props => props.theme.palette.primary} !important;
	font-family: 'Quicksand Medium';
	padding: 10px 30px;
	transition: all 0.3s ease;
	margin-right: 10px;
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
		border: 1px solid #d5cbcb;
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
		border: 1px solid #d5cbcb;
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
		float: right;
		margin-top: 40px;
		padding: 8px 18px;
		font-family: Quicksand;
		font-style: normal;
		font-weight: bold;
		font-size: 16px;
		line-height: 20px;
		border-radius: 70px;
	}

	.create {
		background: #470c75;
		border-color: #470c75;
		color: #ffffff;
		margin-left: 20px;
	}

	.cancel {
		background: #ffffff;
		border-color: #470c75;
		color: #470c75;
	}
`

export const InnerFieldContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	.field-help-text {
	}
`

export const FakeLink: any = styled.span`
	cursor: ${(props: any) => (props.disableLink ? 'not-allowed' : 'pointer')};
	color: blue;
	text-decoration: underline;
	&:hover {
		color: purple !important;
	}
`

export const TableHead = styled(TH)`
	background-color: ${props => props.theme.palette.primary};
	.MuiTableCell-head {
		color: white;
	}
`

export const TableCellHeader = styled(TableCell)`
	font-family: 'Quicksand Bold' !important;
`

export const TableCellBody = styled(TableCell)`
	font-family: 'Quicksand' !important;
	input {
		accent-color: ${props => props.theme.palette.input.main};
	}
`

export const Checkbox = styled(Form.Check)`
	label {
		margin: 0;
	}
	.form-check-input:checked {
        background-color: ${props => props.theme.palette.input.main};
        border-color: ${props => props.theme.palette.input.main};
    }
`

export const TaxForm = styled(Form)`
	display: flex;
	flex-direction: column;
	gap: 20px;
	label {
		margin-top: 5px !important;
	}
	.selectedRadio {
		border-color: ${props => props.theme.palette.input.border};
		background: ${props => props.theme.palette.input.main} !important;
		color: #ffffff !important;
		padding: 8px 12px !important;
		margin-top: 4px !important;

		label {
			line-height: 25px;
			color: #ffffff;
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
			background-color: ${props => props.theme.palette.input.main};
		}
	}
	.form-check {
		border: 1px solid;
		border-radius: 15px;
		.form-check-label {
			margin-top: 5px !important;
		}
	}
`

export const TaxEndDiv = styled.div`
	button {
		margin-top: 0 !important;
	}
	input {
		padding: 5px;
	}
`
