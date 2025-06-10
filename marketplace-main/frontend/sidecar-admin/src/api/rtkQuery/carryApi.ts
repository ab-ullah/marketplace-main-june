import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQuery} from "./config";
import { url } from "inspector";
import { method } from "lodash";
import { transformParticipantsToMap } from "../../pages/CarryManagement/components/ManagerParticipantsPage/components/FirmOverviewSection/constants";

export const carryApi = createApi({
  baseQuery,
  reducerPath: "carryApi",
  endpoints: (build) => ({
    getCarryPools: build.query<any, number>({
        query: (carryPlanId) => `admin/carry_pools/carry-plan/${carryPlanId}/carry-sub-pools`
    }),
    updateCarryPool: build.mutation({
      query: ({poolId, ...body}) => ({
        url: `admin/carry_pools/carry-plan/carry-sub-pools/${poolId}`,
        method: "PATCH",
        body: body,
      }),
    }),
    deleteCarryPool: build.mutation({
      query: ({ poolId }) => ({
        url: `admin/carry_pools/carry-plan/carry-sub-pools/${poolId}`,
        method: "DELETE",
      }),
    }),
    moveUnallocatedPoints: build.mutation<void, any>({
        query: (body) => ({
            url: 'admin/carry_pools/carry-plan/carry-sub-pools/move-unallocated',
            method: 'POST',
            body
        })
    }),
    createNewPool: build.mutation<void, any>({
        query: (body) => ({
            url: 'admin/carry_pools/carry-plan/carry-sub-pools',
            method: 'POST',
            body
        })
    }),
    fetchInvestmentTranche: build.query<any, void>({
      query: () => 'admin/carry_pools/investment-tranches'
  }),
    createInvestmentTranche: build.mutation<void, any>({
      query: (body) => ({
          url: 'admin/carry_pools/investment-tranches',
          method: 'POST',
          body
      })
  }),
  updateInvestmentTranche: build.mutation<void, any>({
    query: (body) => ({
        url: `admin/carry_pools/investment-tranches/${body.id}`,
        method: 'PATCH',
        body
    })
}),
  fetchDealInvestmentTranches: build.query<any[], any>({
  query: (dealId) => ({
      url: `admin/carry_pools/deals/${dealId}/investment-tranches`,
      method: 'GET',
  })
  }),
      requestUserAllocationsExport: build.mutation({
          query: ({userId, ...body}) => ({
              url: `admin/carry_pools/participants/${userId}/allocations/export`,
              method: "POST",
              body,
          }),
      }),
  createAllocationAdjustment: build.mutation<void, any>({
        query: (body) => ({
            url: `admin/carry_pools/carry-plan/${body.carry_plan}/adjustment`,
            method: 'POST',
            body
        })
    }),
    fetchManagerFirmOverview: build.query<any, void>({
      query: () => `admin/carry_pools/reporting/manager/firm`,
      transformResponse: (res: any) => {
        const { carry_plans, participants } = res
        return {carry_plans,participants: transformParticipantsToMap(participants), lastUpdated: new Date().toISOString()}
      },
  }),
  }),
});


export const {
    useGetCarryPoolsQuery,
  useUpdateCarryPoolMutation,
  useDeleteCarryPoolMutation,
  useMoveUnallocatedPointsMutation,
  useCreateNewPoolMutation,
  useFetchInvestmentTrancheQuery,
  useLazyFetchInvestmentTrancheQuery,
  useCreateInvestmentTrancheMutation,
  useUpdateInvestmentTrancheMutation,
  useFetchDealInvestmentTranchesQuery,
  useRequestUserAllocationsExportMutation,
  useCreateAllocationAdjustmentMutation,
  useFetchManagerFirmOverviewQuery,
} = carryApi;

export default carryApi
