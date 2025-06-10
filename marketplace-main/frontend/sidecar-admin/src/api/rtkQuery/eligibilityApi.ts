import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";

export const api = createApi({
  baseQuery,
  reducerPath: "eligibilityApi",
  tagTypes: ["SMART_BLOCK", "SMART_BLOCK_FIELDS"],
  endpoints: (build) => ({
    updateBlockPosition: build.mutation({
      query: ({ blockId, position }) => ({
        url: `admin/eligibility_criteria/criteria_block/${blockId}/position`,
        method: "PATCH",
        body: { new_position: position },
      }),
    }),
    deleteEligibilityCriteria: build.mutation({
      query: ({ id }) => ({
        url: `admin/eligibility_criteria/${id}`,
        method: "DELETE",
      }),
    }),
    addCustomSmartBlock: build.mutation({
      query: ({ fundId, eligibilityId, title }) => ({
        url: `admin/eligibility_criteria/custom_smart_blocks`,
        method: "POST",
        body: { fund: fundId, eligibility_criteria: eligibilityId, title },
      }),
    }),
    updateCustomSmartBlock: build.mutation({
      query: ({ blockId, ...data }) => ({
        url: `admin/eligibility_criteria/custom_smart_blocks/${blockId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SMART_BLOCK"]
    }),
    fetchCustomSmartBlock: build.query({
      query: (blockId) => `admin/eligibility_criteria/custom_smart_blocks/${blockId}`,
      keepUnusedDataFor: 0,
      providesTags: ["SMART_BLOCK"]
    }),

    createCustomSmartBlockFields: build.mutation({
      query: ({ block, title, marks_as_eligible, reviewers_required, required_documents, 
        is_text_explanation_enabled, text_explanation, is_nested_fields_enabled, parent_field }) => ({
        url: `admin/eligibility_criteria/custom_smart_blocks/${block}/fields`,
        method: "POST",
        body: {
          block, title, marks_as_eligible, reviewers_required, required_documents, 
          is_text_explanation_enabled, text_explanation, is_nested_fields_enabled, parent_field
        },
      }),
    }),
    updateCustomSmartBlockFields: build.mutation({
      query: ({ block, documentId, ...data }) => ({
        url: `admin/eligibility_criteria/custom_smart_blocks/${block}/fields/${documentId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SMART_BLOCK_FIELDS"]
    }),
    deleteCustomSmartBlockFields: build.mutation({
      query: ({ block, fieldId }) => ({
        url: `admin/eligibility_criteria/custom_smart_blocks/${block}/fields/${fieldId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SMART_BLOCK_FIELDS"]
    }),
    fetchCustomSmartBlockFields: build.query({
      query: (blockId) => `admin/eligibility_criteria/custom_smart_blocks/${blockId}/fields`,
      keepUnusedDataFor: 0,
      providesTags: ["SMART_BLOCK_FIELDS"]
    }),

  }),
});

export const {
  useUpdateBlockPositionMutation,
  useDeleteEligibilityCriteriaMutation,
  useAddCustomSmartBlockMutation,
  useUpdateCustomSmartBlockMutation,
  useFetchCustomSmartBlockQuery,
  useFetchCustomSmartBlockFieldsQuery,
  useCreateCustomSmartBlockFieldsMutation,
  useUpdateCustomSmartBlockFieldsMutation,
  useDeleteCustomSmartBlockFieldsMutation,
} = api;
