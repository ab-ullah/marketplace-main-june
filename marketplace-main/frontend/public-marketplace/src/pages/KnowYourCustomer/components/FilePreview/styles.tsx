import { Modal } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'

export const SideCarModal = styled(Modal)`
	.modal-content {
		border-radius: 12px;
		border: none;
	}

	.modal-header {
		background: white;
		border-top-right-radius: 12px;
		border-top-left-radius: 12px;
		font-family: Inter;
		font-size: 40px;
		color: #ffffff;
		font-weight: 700;
	}

	.btn-close {
		background-color: rgba(255, 255, 255, 0.8);
		font-size: 14px;
		border-radius: 50%;
		color: black;
		margin-right: 10px;
	}

	.container-fluid {
		font-family: 'Quicksand';
		font-size: 20px;
		color: white;
	}

	.container {
		font-family: 'Quicksand';
		font-size: 18px;
		color: white;
	}
`

export const ModalContainer = styled(SideCarModal)`
	.modal-dialog {
		.modal-content {
			min-height: 600px;
			min-width: 720px;
			@media (max-width: 768px) {
				max-width: 100vw;
			}
			.modal-header {
				background: white;
				border-bottom: none;
				.modal-title {
					color: white;
				}
			}
			.modal-body {
				//height:calc(80vh - 240px);
				min-height: 600px;
				object {
					flex: 1;
					width: 100%;
					span {
						align-items: center;
						display: flex;
						flex: 1;
						height: 100%;
						justify-content: center;
					}
				}
				display: flex;
				flex-direction: column;
			}
		}
	}
`

export const CloseButton = styled(Button)`
	align-self: flex-end;
	background-color: ${props => props.theme.palette.primary} !important;
	border-color: ${props => props.theme.palette.primary} !important;
	border-radius: 70px;
	margin-top: 30px;
	padding: 10px 30px;
	width: fit-content;
	:hover {
		background-color: ${props => props.theme.palette.primary} !important;
		border-color: ${props => props.theme.palette.primary} !important;
	}
`

export const FileName = styled.span`
	cursor: pointer;
`

export const PreviewContainer = styled.div`
	align-items: center;
	background-color: #eceff1;
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-content: center;
	img {
		max-width: 90%;
	}
	iframe {
		width: 100%;
		height: 100%;
	}
`

export const PDFContainer = styled.div`
	height: 100%;
	max-height: 600px;
	overflow: auto;
`
