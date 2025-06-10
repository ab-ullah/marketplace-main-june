/* eslint-disable import/prefer-default-export */
import { Grid } from '@mui/material'
import { styled } from '@mui/system'

const CardCont = styled('div')({
	backgroundColor: 'white',
	border: '1px solid #CFD8DC',
	borderRadius: '8px',
	overflow: 'hidden',
})

const Header = styled('div')({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'flex-start',
})

const CardLogo = styled('img')({
	height: '25px',
	width: 'auto',
})

const Cell = styled('span')({
	whiteSpace: 'nowrap',
	borderRadius: '100px',
	padding: '5px 8px',
})

const Title = styled('p')({
	fontWeight: 700,
	fontSize: '36px',
	letterSpacing: '0.02em',
	lineHeight: '45px',
	margin: '0px',
})

const TagsCont = styled('div')({
	overflow: 'hidden',
})

const TagsBody = styled('div')({
	gap: '10px',
	display: 'flex',
	flexDirection: 'row',
	overflowX: 'scroll',
	overflowY: 'hidden',
	marginBottom: '-10px',
	paddingBottom: '10px',
	flexWrap:'wrap'
})

const SmallIcon = styled('img')({
	width: '13px',
	height: 'fot-content',
})

const BodyText = styled('span')({
	fontSize: '14px',
	fontWeight: 500,
	lineHeight: '17.5px',
	letterSpacing: '0.02em',
})

const DescriptionBlock = styled('div')({
	h1: {
		margin: '0px',
	},
	h2: {
		margin: '0px',
	},
	h3: {
		margin: '0px',
	},
	p: {
		margin: '0px',
	},
})

const BtnsSection = styled('div')({
	display: 'flex',
	gap: '5px',
	paddingTop: '0px',
})

const AccBtnsSection = styled(BtnsSection)({
	flexDirection: 'column',
	padding: '32px',
	paddingTop: '0px',
	gap: '24px',
})

const FirstSection = styled('div')({
	padding: '32px',
	display: 'flex',
	flexDirection: 'column',
	gap: '33px',
})

const ColGap5 = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: '5px',
})

const RowGap10 = styled('div')({
	display: 'flex',
	flexDirection: 'row',
	gap: '10px',
	alignItems: 'center',
})

const SecondSection = styled(Grid)(({ theme }) => ({
	padding: '32px',
	width: '100% !important',
	marginLeft: '0px !important',
	background: theme.palette.secondary.light,
}))

const DetailCard = styled(Grid)({
	paddingLeft: '0px !important',
})

const DetailTitle = styled('h4')({
	fontWeight: 700,
	fontSize: '20px',
	lineHeight: '30px',
	margin: '0px',
})

const DetailDescription = styled('p')({
	fontWeight: 500,
	fontSize: '16px',
	lineHeight: '20px',
	letterSpacing: '0.02em',
	margin: '0px',
})

const CommitmentSection = styled(Grid)(({ theme }) => ({
	display: 'flex',
	flexWrap: 'wrap',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: '32px',
	background: theme.palette.secondary.light,
	borderTop: '1px solid #CFD8DC',
}))
const CommitmentAmount = styled('h4')(({ theme }) => ({
	color: theme.palette.primary.main,
	fontWeight: '700',
	fontSize: '30px',
	lineHeight: '30px',
	margin: '0px',
}))

const CommitmentText = styled('span')({
	fontSize: '16px',
	fontWeight: 500,
	lineHeight: '20px',
	letterSpacing: '0.02em',
})

export {
	CardCont,
	Header,
	CardLogo,
	Cell,
	Title,
	TagsCont,
	TagsBody,
	SmallIcon,
	DescriptionBlock,
	BodyText,
	BtnsSection,
	AccBtnsSection,
	FirstSection,
	SecondSection,
	DetailTitle,
	DetailDescription,
	DetailCard,
	ColGap5,
	RowGap10,
	CommitmentSection,
	CommitmentAmount,
	CommitmentText,
}
