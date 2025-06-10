import 'styled-components'

declare module 'styled-components' {
	export interface DefaultTheme {
		borderRadius: string
		baseLine: number
		palette: {
			primary: string
			input: {
				main: string
				border: string
				background: string
			}
			common: {
				brandColor: string
				highlightColor: string
				greenTextColor: string
				primaryTextColor: string
				secondaryTextColor: string
				graphHeadingColor: string
				disableTextColor: string
				bannerTextColor: string
				tableTextColor: string
				sectionHeading: string
				statValueColor: string
				linkTextColor: string
				grayColor: string
				darkNavyBlueColor: string
				darkDesaturatedBlueColor: string
				desaturatedBlueColor: string
				lightGrayishBlueColor: string
				borderLightBlueColor: string
				borderGrayColor: string
			}
			eligibilityTheme: {
				black: string
				grayishBlue: string
				grayLightest: string
				flatBlue: string
				purplePrimary: string
				purple: string
				contentPadLg: string
				borderColor: string
				clrSuccess: string
				clrDanger: string
				clrWarning: string
				greyBg: string
			}
			button: {
				background: string
				hover: string
			}
		}
	}
}
