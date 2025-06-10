import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { useEffect, useState } from 'react'
import { getCompanyTheme } from 'services/User'
import { useLocation } from 'react-router-dom'

// const currentTheme = 1

const convertToHex=(percentage:number)=>{
	return Math.round((percentage / 100) * 255).toString(16).toUpperCase()
}

// const theme1 = {
// 	primary: {
// 		main: '#0A6B3D',
// 		dark: '#0A6B3D',
// 	},
// 	secondary: {
// 		main: '#E2EDE9',
// 		light: 'rgba(240, 250, 235, 0.2)',
// 	},
// 	cell: {
// 		background: 'rgba(226, 237, 232, 0.5)',
// 	},
// }

export const themeColor= '#407096'

const theme = ((primary) => {
	
	return {
		primary: {
			main: primary,
			dark: primary,
		},
		secondary: {
			main: `${primary}${convertToHex(15)}`,
			light: `${primary}${convertToHex(7)}`,
		},
		cell: {
			background: '#E4EAF6',
		},
	}
})(themeColor)

// const themes = [theme1, theme2]

const defaultTheme = createTheme({
	typography: {
		fontFamily: 'Quicksand',
	},

	palette: {
		...theme,
		error: {
			main: red.A400,
		},
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 900,
			lg: 1300,
			xl: 1536,
		},
	},
})

const defaultRes = {
	data: {
		palette: {
			...theme,
			common: {
				brandColor: '#413C69',
				greenTextColor: '#10AC84',
				primaryTextColor: '#020203',
				secondaryTextColor: '#020203',
				bannerTextColor: '#607D8B',
				tableTextColor: '#091626',
				sectionHeading: '#2E2E3A',
				statValueColor: '#03145E',
				grayColor: '#F0F0F0',
				darkNavyBlueColor: '#03145E',
				darkDesaturatedBlueColor: '#413C69',
				desaturatedBlueColor: '#607D8B',
				lightGrayishBlueColor: '#E2E1EC',
				borderLightBlueColor: '#EBf0FF',
				borderGrayColor: '#A3A2A2',
			},
			button: {
				hover: '#1DD1A1',
			},
		},
		components: {
			pagePadding: {
				default: '60px 56px',
			},
		},
	},
}

// eslint-disable-next-line import/prefer-default-export
export const useCustomTheme = () => {
	const [theme, setTheme] = useState(defaultTheme)
	const [updated, setUpdated] = useState(false)
	const location = useLocation()
	const companyName = location.pathname.split('/')[1]

	const handleUpdateTheme = async () => {

		const themeRes = await getCompanyTheme(companyName)
		let companyTheme=null
		if(themeRes.success){
			companyTheme=themeRes.data.theme
			companyTheme.components.logo=themeRes.data.logo || ''
			companyTheme.components.tech_partner_logo=themeRes.data.tech_partner_logo || ''
			localStorage.setItem("companyName", companyName as string);
		}

		const newTheme = companyTheme || defaultRes.data 
		const updatedTheme = createTheme(theme, newTheme)
		setTheme(updatedTheme)
		setUpdated(true)
	}

	useEffect(() => {
		handleUpdateTheme()
	}, [companyName])

	return { theme: responsiveFontSizes(theme), loading: !updated }
}
