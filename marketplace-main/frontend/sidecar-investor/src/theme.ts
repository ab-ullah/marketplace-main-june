import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import API from './api/backendApi'
import { DefaultTheme } from 'styled-components'
import { INVESTOR_URL_PREFIX } from './constants/routes'

export const defaultTheme: DefaultTheme = {
  logo:'',
  borderRadius: '4px',
  baseLine: 20,
  palette: {
    primary: '#4A47A3',
		input: {
			main: '#4A47A3',
			border: 'rgba(74, 71, 163, 0.5)',
			background: 'rgba(226, 225, 236, 0.3)',
		},
    common: {
      brandColor: '#413C69',
      highlightColor: '#E2E1EC',
      greenTextColor: '#10AC84',
      primaryTextColor: '#020203',
      secondaryTextColor: '#020203',
      disableTextColor: '#CFD8DC',
      bannerTextColor: '#607D8B',
      tableTextColor: '#091626',
      sectionHeading: '#2E2E3A',
      graphHeadingColor: '#393940',
      statValueColor: '#03145E',
      linkTextColor: '#3B60F1',
      grayColor: '#F0F0F0',
      darkNavyBlueColor: '#03145E',
      darkDesaturatedBlueColor: '#413C69',
      desaturatedBlueColor: '#413C69',
      lightGrayishBlueColor: '#E2E1EC',
      borderLightBlueColor: '#EBf0FF',
      borderGrayColor: '#A3A2A2'
    },
    eligibilityTheme: {
      black: '#020203',
      grayishBlue: '#B0BEC5',
      grayLightest: '#ECEFF1',
      flatBlue: '#2E86DE',
      purplePrimary: '#470C75',
      purple: '#413C69',
      contentPadLg: '56px',
      borderColor: '#D5CBCB',
      clrSuccess: '#10AC84',
      clrDanger: '#F42222',
      clrWarning: '#E37628',
      greyBg: '#E5E5E5',
    },
    button: {
      background: '#0D8A6A',
      hover: '#1DD1A1',
    }
  }
}


export const useCustomStyledTheme = () => {
	const [theme, setTheme] = useState(defaultTheme)
	const [updated, setUpdated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
	const location = useLocation()
	const companyName = location.pathname.split('/')[1]

	const handleUpdateTheme = async () => {

		const themeRes = await API.getCompanyTheme(companyName)
		let companyTheme=null
		if(themeRes.success){
			companyTheme={...themeRes.data.theme}
      companyTheme.borderRadius= '4px'
      companyTheme.baseLine= 20
			companyTheme.palette.primary=companyTheme.palette.primary.main
			companyTheme.palette.input ={
				main:companyTheme.palette.primary.main || companyTheme.palette.primary,
			border: 'rgba(74, 71, 163, 0.5)',
			background: 'rgba(226, 225, 236, 0.3)',
			}
			companyTheme.palette.button= {
				background: '#0D8A6A',
				hover: companyTheme.palette.button.hover,
			}
      companyTheme.palette.common={
        ...theme.palette.common,
        ...companyTheme.palette.common
      }
      companyTheme.logo = themeRes.data.logo || ''
      localStorage.setItem("companyName", companyName as string);
		}
		const newTheme = companyTheme || defaultTheme
		setTheme(newTheme)
		setUpdated(true)
	}

	useEffect(() => {
    if (accessToken) {
      if (companyName === INVESTOR_URL_PREFIX) setUpdated(true);
      else handleUpdateTheme();
    }
  }, [companyName, accessToken]);

	return { theme: theme, loading: !updated, setToken:setAccessToken }
}