import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import Loader from 'components/Loader'
import { useCustomTheme } from 'styles/muiTheme'
import { useCustomStyledTheme } from 'styles/styledTheme'

const CustomThemeProvider = ({ children }: any) => {
	const { theme:MuiTheme, loading: MuiLoading } = useCustomTheme()
	const {theme:StyledTheme, loading: StyledLoading } = useCustomStyledTheme()

	const isLoading = MuiLoading || StyledLoading

	return (
		<ThemeProvider theme={MuiTheme}>
			<StyledThemeProvider theme={StyledTheme}>
			{isLoading && <Loader />}
			<div style={isLoading ? { height: '0px', overflow: 'hidden' } : {}}>
				{children}
			</div>
			</StyledThemeProvider>
		</ThemeProvider>
	)
}

export default CustomThemeProvider
