/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: '8px',
})

const Title = styled('p')({
	fontWeight: '700',
	fontSize: '36px',
	lineHeight: '45px',
	marginTop: '0px',
})

const DocTile = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	// alignItems: 'flex-start',
	alignItems: 'center',
	padding: '24px',
	gap: '24px',
	// width: '948px',
	// height: '96px',
	background: '#FFFFFF',
	border: '1px solid #CFD8DC',
	borderRadius: '8px',
	flex: 'none',
	order: '0',
	alignSelf: 'stretch',
	flexGrow: '0',
	cursor: 'pointer',
})

const DetailSection = styled('div')({
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '0px',
	gap: '16px',
})

const DocName = styled('h4')({
	fontWeight: '600',
	fontSize: '24px',
	lineHeight: '32px',
	margin: '0px',
})

const DocDetail = styled('h3')({
	fontWeight: '500',
	fontSize: '16px',
	lineHeight: '24px',
	margin: '0px',
})

const Icon = styled('img')({
	width: '34px',
	height: 'fit-content',
})

export { Cont, DocTile, DetailSection, Icon, DocName, DocDetail, Title }
