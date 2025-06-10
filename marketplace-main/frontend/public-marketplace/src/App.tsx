import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import HomePage from 'pages/HomePage'
import Login from 'pages/Login'
import Consent from 'pages/ConsentPage'
import ProgramPage from 'pages/ProgramPage'
import OpportunityOnboarding from 'pages/OpportunityOnboarding'
import KnowYourCustomer from 'pages/KnowYourCustomer'
import TaxForms from 'pages/TaxForms'
import BankDetailsForm from 'pages/BankDetailsForm'
import OpportunityDetail from 'pages/OpportunityDetail'
import Header from 'components/Header'
import Footer from 'components/Footer'
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history'
import ProtectedComponent from './auth/protected-components'
import { store } from './app/store'
import FundDocuments from "./pages/FundDocuments";
import StoreDocuSignResp from "./pages/ProgramDoc/StoreDocuSignResp";
import CustomThemeProvider from 'components/CustomThemeProvider'
import NotFound from 'pages/NotFound'

const prefixSlug ='/:company/'

const App = () => {


	return (
				<Provider store={store}>
					<Router>
						<Auth0ProviderWithHistory>
						<CustomThemeProvider>
							<div>
								<Header />
								<div>
									<Routes>
										<Route
											path={`${prefixSlug}`}
											element={
												<ProtectedComponent
													Component={HomePage}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}login`}
											element={<Login />}
										/>
										<Route
											path={`${prefixSlug}consent`}
											element={
												<ProtectedComponent
													Component={Consent}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}programs/:id`}
											element={
												<ProtectedComponent
													Component={ProgramPage}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}opportunity/:externalId/onBoarding`}
											element={
												<ProtectedComponent
													Component={
														OpportunityOnboarding
													}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}funds/:fundSlug/program_doc/:envelopeId/:viewType`}
											element={
												<ProtectedComponent
													Component={
														StoreDocuSignResp
													}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}funds/:externalId/amlkyc`}
											element={
												<ProtectedComponent
													Component={KnowYourCustomer}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}funds/:externalId/review_docs`}
											element={
												<ProtectedComponent
													Component={FundDocuments}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}funds/:externalId/tax`}
											element={
												<ProtectedComponent
													Component={TaxForms}
												/>
											}
										/>
										<Route
											path={`${prefixSlug}funds/:externalId/bank_details`}
											element={
												<ProtectedComponent
													Component={BankDetailsForm}
												/>
											}
										/>
									{/* <Route
										path='/'
										element={
											<ProtectedComponent
												Component={HomePage}
											/>
										}
									/>
									<Route path='login' element={<Login />} />
									<Route
										path='consent'
										element={
											<ProtectedComponent
												Component={Consent}
											/>
										}
									/>
									<Route
										path='programs/:id'
										element={
											<ProtectedComponent
												Component={ProgramPage}
											/>
										}
									/>
									<Route
										path='opportunity/:externalId/onBoarding'
										element={
											<ProtectedComponent
												Component={
													OpportunityOnboarding
												}
											/>
										}
									/> */}
									<Route
										path={`${prefixSlug}opportunity/:externalId/detail`}
										element={
											<ProtectedComponent
												Component={OpportunityDetail}
											/>
										}
									/>
									<Route
									path='*'
									element={<NotFound/>}
									/>
								</Routes>
								</div>
								<Footer />
							</div>
							</CustomThemeProvider>
						</Auth0ProviderWithHistory>
					</Router>
				</Provider>
	)
}

export default App
