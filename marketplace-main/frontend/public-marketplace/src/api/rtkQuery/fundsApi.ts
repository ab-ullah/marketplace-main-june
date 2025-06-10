/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './config'

export const api = createApi({
	baseQuery,
	reducerPath: 'fundsApi',
	tagTypes: [
		'Banking_Details',
		'Pending_Application_Requests',
		'Program_Docs',
		'applicationNextState',
	],
	endpoints: build => ({
		getFundDetails: build.query({
			query: externalId => `funds/external_id/${externalId}`,
			keepUnusedDataFor: 0,
		}),
		getDocuments: build.query({
			query: externalId => `funds/external_id/${externalId}/documents`,
			keepUnusedDataFor: 0,
		}),
		getApprovedDocuments: build.query({
			query: externalId =>
				`funds/external_id/${externalId}/documents/response`,
			keepUnusedDataFor: 0,
		}),
		getApplicationStatus: build.query({
			query: externalId =>
				`applications/application-workflow-status/${externalId}`,
			keepUnusedDataFor: 0,
		}),
		getApplicationModuleState: build.query({
			query: externalId =>
				`applications/application-module-states/${externalId}`,
			keepUnusedDataFor: 0,
		}),
		getApplicationNextState: build.query({
			query: (externalId) => `applications/application-next-state/${externalId}`,
			keepUnusedDataFor: 0,
			providesTags: ['applicationNextState']
		}),
		submitApprovedDocuments: build.mutation({
			query: ({ externalId, ...body }) => ({
				url: `funds/external_id/${externalId}/documents/response`,
				method: 'POST',
				body,
			}),
		}),
		saveApplicationEntityType: build.mutation({
			query: ({ recordUUID, externalId, kycInvestorType }) => ({
				url: `kyc_records/${recordUUID}/funds/${externalId}/update-workflow`,
				method: 'PATCH',
				body: { kyc_investor_type: kycInvestorType },
			}),
		}),
		hasPendingRequests: build.query({
			query: externalId =>
				`applications/funds/${externalId}/has-pending-requests`,
			keepUnusedDataFor: 0,
			providesTags: ['Pending_Application_Requests'],
		}),
		submitApplicationChanges: build.mutation({
			query: externalId => ({
				url: `/applications/submit-changes`,
				method: 'POST',
				body: { fund_external_id: externalId },
			}),
			invalidatesTags: ['Pending_Application_Requests'],
		}),
		saveBankingDetails: build.mutation({
			query: ({ externalId, ...body }) => ({
				url: `payments/detail/${externalId}`,
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Banking_Details'],
		}),
		updateBankingDetails: build.mutation({
			query: ({ fundId, ...body }) => ({
				url: `payments/detail/${fundId}/update`,
				method: 'PUT',
				body,
			}),
			invalidatesTags: ['Banking_Details'],
		}),
		fetchBankingDetails: build.query({
			query: externalId => `payments/detail/${externalId}`,
			keepUnusedDataFor: 0,
			providesTags: ['Banking_Details'],
		}),
		fetchSignedPowerOfAttorney: build.query({
			query: externalId =>
				`/companies/users/by-fund/${externalId}/attorney-document`,
			keepUnusedDataFor: 0,
			providesTags: ['Program_Docs'],
		}),
		fetchProgramDocs: build.query({
			query: ({ externalId, skipRquiredOnce }) =>
				`/applications/funds/${externalId}/company-documents/${skipRquiredOnce}`,
			keepUnusedDataFor: 0,
			providesTags: ['Program_Docs'],
		}),
		deleteSignedProgramDocs: build.mutation({
			query: ({ documentId }: any) => ({
				url: `documents/${documentId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Program_Docs'],
		}),
		deleteSignedPowerOfAttorney: build.mutation({
			query: documentId => ({
				url: `/documents/${documentId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Program_Docs'],
		}),
		fetchPowerOfAttorney: build.query({
			query: externalId => `companies/by-fund/${externalId}`,
			keepUnusedDataFor: 0,
		}),
		updateApplicationStatus: build.mutation({
			query: ({ applicationUuId, status }) => ({
				url: `applications/${applicationUuId}`,
				method: 'PATCH',
				body: { status },
			}),
		}),
		updateCommentStatus: build.mutation({
			query: ({ module, moduleId }) => ({
				url: `comments/update-by-module`,
				method: 'POST',
				body: { module, module_id: moduleId },
			}),
		}),
		updateModulePosition: build.mutation({
			query: ({ moduleId, externalId, currentStep }) => ({
				url: `applications/funds/${externalId}/state`,
				method: 'POST',
				body: { module: moduleId, last_position: currentStep },
			}),
		}),
		fetchModulePosition: build.query({
			query: externalId => `applications/funds/${externalId}/state`,
			keepUnusedDataFor: 0,
		}),
		getDefaultOnBoardingDetails: build.query({
			query: externalId => `applications/funds/${externalId}/default`,
			keepUnusedDataFor: 0,
		}),
	}),
})

export const {
	useGetFundDetailsQuery,
	useGetDocumentsQuery,
	useGetApprovedDocumentsQuery,
	useSubmitApprovedDocumentsMutation,
	useSaveBankingDetailsMutation,
	useFetchBankingDetailsQuery,
	useUpdateBankingDetailsMutation,
	useSaveApplicationEntityTypeMutation,
	useHasPendingRequestsQuery,
	useSubmitApplicationChangesMutation,
	useFetchSignedPowerOfAttorneyQuery,
	useFetchPowerOfAttorneyQuery,
	useDeleteSignedProgramDocsMutation,
	useDeleteSignedPowerOfAttorneyMutation,
	useUpdateApplicationStatusMutation,
	useGetApplicationStatusQuery,
	useUpdateCommentStatusMutation,
	useUpdateModulePositionMutation,
	useFetchModulePositionQuery,
	useGetDefaultOnBoardingDetailsQuery,
	useFetchProgramDocsQuery,
	useGetApplicationModuleStateQuery,
	useGetApplicationNextStateQuery,
} = api
