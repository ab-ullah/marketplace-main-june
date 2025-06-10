import { useLocation, useParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles';
import Logo from 'assets/images/InfluentLogo.svg'
import useWindowDimensions from 'utils/WindowDimensions'
import {INVESTOR_ORIGIN, INVESTOR_URL_PREFIX} from 'constants/routes'
import { useEffect, useState } from 'react'
import DropDown from './components/DropDown'
import Drawer from './components/Drawer'
import {
	PageCont,
	HeaderLogo,
	RightPadding,
	MidPadding,
	FlexRow,
	HeaderText,
	LogoCont,
} from './styled'
import { ADVISOR_FLOW_FLAG, CARRY_FLAG, CARRY_LINK, HOME_LINK, PORTFOLIO_LINK, SM } from './constants'
import { get } from 'lodash';
import API from '../../api/marketplaceApi';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import AdvisorUserSelector from 'components/AdvisorUserSelector';
import { OptionTypeBase } from 'react-select';
import { fetchAdvisorCompanyUsers, setAdvisorId } from 'pages/User/thunks';
import { useAppDispatch } from 'app/hooks';
import { getUserInfo } from 'services/User';
import { UserInfo } from 'interfaces/User';
import { VIEW_AS_ADVISOR_HEADER } from 'constants/headers';
import { ISelectOptionNumValue } from 'interfaces/form';
import { advisorSelectedHexParam, hexToString } from 'utils/helpers';

const dissAllowedPages = ['login']
const currentPage = 'Home'

// interface HeaderProps {
// 	onViewAsAdvisorChange: any
// 	viewAsAdvisor:OptionTypeBase | null | undefined;
//   }

const Header = () => {
	const { pathname } = useLocation()
	const { isAuthenticated } = useAuth0()
	const token = axios.defaults.headers.common.Authorization
	const theme = useTheme()
	const companyLogo = get(theme,'components.logo')
	const [open, setOpen] = useState(false)
	const [navLinks, setNavLinks] = useState<any[]>([HOME_LINK, PORTFOLIO_LINK]);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
	const [isAdvisorFlowEnabled, setIsAdvisorFlowEnabled] = useState<boolean>(false)
	const hide = pathname.split('/').some(item => dissAllowedPages.includes(item));
	const { width } = useWindowDimensions()
	const mobileVersion = () => width < SM
	const location = useLocation();
	const dispatch = useAppDispatch()
	const companyName = location.pathname.split('/')[1]
	const handleNavigate = (link: string) => {
		window.open(
			`${INVESTOR_ORIGIN}/${companyName}/${INVESTOR_URL_PREFIX}${link}?mp=true${advisorSelectedHexParam()}`,
			'_self',
		)
	}

	const [viewAsAdvisor, setViewAsAdvisor] = useState<ISelectOptionNumValue | null>(null)

	const handleViewAsAdvisorChange = (selectedOption: ISelectOptionNumValue | null) => {
		// axios.defaults.headers.common[VIEW_AS_ADVISOR_HEADER] = selectedOption ? selectedOption.value : null;
		localStorage.setItem('advisor_selected',JSON.stringify(selectedOption ||"{}"))
		// setViewAsAdvisor(selectedOption)
		dispatch(setAdvisorId(selectedOption?.value.toString() || ""))
		window.location.reload()
	  }

	const fetchFeatureFlag = async () => {
		try {
			const data = await API.getFeatureFlag(CARRY_FLAG)
			const isActive = get(data, 'is_active', true)
			isActive && setNavLinks([
				...navLinks,
				CARRY_LINK
			])
		}
		catch(e) {
			console.error(e)
		}
	}

	const fetchAdvisorFlowFlag = async () => {
		try {
			const data = await API.getFeatureFlag(ADVISOR_FLOW_FLAG)
			const isActive = get(data, 'is_active')
			// if(!isActive){
			// 	handleViewAsAdvisorChange(null)
			// }
			setIsAdvisorFlowEnabled(isActive)
			
		}
		catch(e) {
			console.error(e)
		}
	}

	const handleUserInfo = async () => {
		const res = await getUserInfo()
		if (res.success) {
			setUserInfo(res.data)
			// if(!userInfo?.is_advisor) handleViewAsAdvisorChange(null)
		}
	}

	useEffect(() => {
		if(isAuthenticated && token) {
			fetchFeatureFlag();
			dispatch(fetchAdvisorCompanyUsers())
			handleUserInfo()
			fetchAdvisorFlowFlag()
		}
	}, [isAuthenticated, token]);

	useEffect(()=>{
		const urlParams = new URLSearchParams(window.location.search);
		const advisorSelectedParamHex = urlParams.get('advisor_selected_hex');
	
		const setAdvisorSelected = (advisorSelected: ISelectOptionNumValue) => {
		  if (advisorSelected?.value) {
			axios.defaults.headers.common[VIEW_AS_ADVISOR_HEADER] =
			  advisorSelected.value;
			setViewAsAdvisor(advisorSelected);
			localStorage.setItem(
			  "advisor_selected",
			  JSON.stringify(advisorSelected || "{}")
			);
		  }
		};
	
		if (advisorSelectedParamHex) {
		  const advisorSelectedFromParam = JSON.parse(
			hexToString(advisorSelectedParamHex)
		  );
		  setAdvisorSelected(advisorSelectedFromParam);
		  urlParams.delete('advisor_selected_hex');
		  const queryString = urlParams.toString();
		  const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
		  window.history.replaceState(null, '', newUrl);
		} else {
		  const advisorSelected = JSON.parse(
			localStorage.getItem("advisor_selected") || "{}"
		  );
		  setAdvisorSelected(advisorSelected);
		}
	  },[])
	  
	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (hide) return <></>
	return (
		<PageCont
			sx={
				mobileVersion() && open
					? {
							boxShadow: 'none !important',
					  }
					: {}
			}
		>
			<FlexRow>
			<LogoCont> {companyLogo &&	<HeaderLogo src={companyLogo} alt='Logo' />} </LogoCont>
				{!mobileVersion() &&
					navLinks.map(({label,link}) => (
						<MidPadding
						onClick={()=>handleNavigate(link)}
							key={label}
							sx={
								label === currentPage
									? { borderColor: 'primary.main' }
									: {}
							}
						>
							<HeaderText>{label}</HeaderText>
						</MidPadding>
					))}
					{userInfo?.is_advisor && isAdvisorFlowEnabled &&<MidPadding>
						<AdvisorUserSelector onChange={handleViewAsAdvisorChange} value={viewAsAdvisor}/>
					</MidPadding>}
			</FlexRow>

			{mobileVersion() ? (
				<RightPadding>
					<Drawer
						currentPage={currentPage}
						sendToParent={(
							e: boolean | ((prevState: boolean) => boolean),
						) => setOpen(e)}
					/>
				</RightPadding>
			) : (
				<FlexRow>
					{['Support'].map(text => (
						<MidPadding key={text}>
							<HeaderText>{text}</HeaderText>
						</MidPadding>
					))}
					<RightPadding sx={{ height: '25px' }}>
						<DropDown />
					</RightPadding>
				</FlexRow>
			)}
		</PageCont>
	)
}

export default Header
