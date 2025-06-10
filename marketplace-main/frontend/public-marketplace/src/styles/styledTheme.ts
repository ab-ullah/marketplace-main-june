/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getCompanyTheme } from 'services/User'
import { DefaultTheme } from 'styled-components'
import {themeColor} from './muiTheme'

export const defaultStyledTheme: DefaultTheme = {
	borderRadius: '4px',
	baseLine: 20,
	palette: {
		primary: themeColor,
		input: {
			main: themeColor,
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
			desaturatedBlueColor: '#607D8B',
			lightGrayishBlueColor: '#E2E1EC',
			borderLightBlueColor: '#EBf0FF',
			borderGrayColor: '#A3A2A2',
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
		},
	},
}

// eslint-disable-next-line import/prefer-default-export
export const useCustomStyledTheme = () => {
	const [theme, setTheme] = useState(defaultStyledTheme)
	const [updated, setUpdated] = useState(false)
	const location = useLocation()
	const companyName = location.pathname.split('/')[1]

	const handleUpdateTheme = async () => {

		const themeRes = await getCompanyTheme(companyName)
		let companyTheme=null
		if(themeRes.success){
			companyTheme=themeRes.data.theme
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
		}

		const newTheme = companyTheme || defaultStyledTheme
		
		setTheme(newTheme)
		setUpdated(true)
	}

	useEffect(() => {
		handleUpdateTheme()
	}, [companyName])

	return { theme: theme, loading: !updated }
}