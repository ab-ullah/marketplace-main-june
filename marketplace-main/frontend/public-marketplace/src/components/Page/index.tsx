/* eslint-disable import/prefer-default-export */
import { ReactNode } from 'react'
import { styled, SxProps } from '@mui/system'
import { useTheme } from '@mui/material'
import useWindowDimensions from 'utils/WindowDimensions'
import { SM as HVBreak } from '../Header/constants'

const Wrapper = styled('div')({
	paddingTop: '87px',
})

const PageWrapper = ({
	children,
	sx = {},
}: {
	children: ReactNode
	sx?: SxProps
}) => {
	const { width } = useWindowDimensions()
	const theme = useTheme()
	const smBreak = theme.breakpoints.values.sm
	const paddingTop = width > HVBreak ? '91' : width > smBreak ? '115' : '80'
	return (
		<Wrapper sx={{ ...sx, paddingTop: `${paddingTop}px` }}>
			{children}
		</Wrapper>
	)
}

PageWrapper.defaultProps = {
	sx: {},
}

export { PageWrapper }
