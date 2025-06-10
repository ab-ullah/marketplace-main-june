import { FunctionComponent, useEffect, useState, useMemo } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { EligibilityContext, getContextData } from "./utils/EligibilityContext";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectAdminFilledRequirement, selectSelectedCriteriaDetail} from "../../selectors";
import size from "lodash/size";
import filter from "lodash/filter";
import { sortCriteriaBlocks, reorder } from "./utils/sortCriteriaBlocks";
import { clearCriteriaDetail } from "../../eligibilityCriteriaSlice";
import { fetchBlockCategories, getFundCriteriaDetail } from "../../thunks";
import AddBlockButton from "./AddBlockModal";
import CriteriaBlockList from "./components/CriteriaBlocksList";
import CriteriaForm from "./components/CriteriaForm";
import { useParams } from "react-router-dom";
import CreationWizard from "../../../../components/CreationWizard";
import WorkFlowReviewTaskModal from "../../../../components/WorkFlowReviewTask/WorkFlowReviewModal";
import { ADMIN_URL_PREFIX } from "../../../../constants/routes";
import Comments from "../../../../components/Comments";
import RequestRevisionButton from "./components/RevisedChangesButton";
import PublishCriteriaButton from "../../../../components/Publish/EligibilityCriteria";
import NotificationModal from "../../../../components/NotificationModal";
import { useUpdateBlockPositionMutation } from "../../../../api/rtkQuery/eligibilityApi";
import { Link } from "./styles";
import { get } from "lodash";


interface EligibilityFormCreationProps {}

const notificationConfig = {
  default: {
    show: false,
    title: "",
    msg: "",
  },
  revision: {
    show: true,
    title: "Revision Requested",
    msg: `Your updates have been sent to the reviewers for review. 
    You will receive a notification when it’s published or need further changes.`,
  },
  publish: {
    show: true,
    title: "Published",
    msg: `Congratulations! Your eligibility criteria has been published`,
  },
};

const EligibilityFormCreation: FunctionComponent<
  EligibilityFormCreationProps
> = () => {
  const [notification, setNotification] = useState(notificationConfig.default);
  const [sortedBlocks, setSortedBlocks] = useState<any>([]);
  const { criteriaId } = useParams<{ criteriaId: string }>();
  const selectedCriteriaDetail = useAppSelector(selectSelectedCriteriaDetail);
  const adminFilledRequirement = useAppSelector(selectAdminFilledRequirement);
  const dispatch = useAppDispatch();
  const [updateBlockPosition] = useUpdateBlockPositionMutation();

  useEffect(() => {
    dispatch(getFundCriteriaDetail(parseInt(criteriaId)));
    return () => {
      dispatch(clearCriteriaDetail());
    };
  }, [criteriaId, dispatch]);

  useEffect(() => {
    if (selectedCriteriaDetail) {
      dispatch(fetchBlockCategories());
    }
  }, [dispatch, selectedCriteriaDetail]);

  const criteriaAdminDetail = selectedCriteriaDetail
    ? adminFilledRequirement[selectedCriteriaDetail.id]
    : "";
  const canSubmit = useMemo(() => {

    const isSmartCriteria = get(selectedCriteriaDetail, 'is_smart_criteria', false)
    const smartCanvasPayload = get(selectedCriteriaDetail, 'smart_canvas_payload', null)

    if(isSmartCriteria){
      return (criteriaAdminDetail
        ? Object.values(criteriaAdminDetail).every((val) => val)
        : true ) && Boolean(smartCanvasPayload)
    }
    else {
      return criteriaAdminDetail
      ? Object.values(criteriaAdminDetail).every((val) => val)
      : true;
    }
  }, [selectedCriteriaDetail, criteriaAdminDetail])

  const filteredBlocks = useMemo(() => {
    if (selectedCriteriaDetail)
      return filter(
        selectedCriteriaDetail.criteria_blocks,
        (block) => !block.is_user_documents_step
      );
    return [];
  }, [selectedCriteriaDetail]);

  const blocks = useMemo(
    () => sortCriteriaBlocks(filteredBlocks),
    [filteredBlocks]
  );

  const isSmartDecisionFlow = useMemo(
    () => {
      return get(selectedCriteriaDetail, 'is_smart_criteria', false)
    },
    [selectedCriteriaDetail]
  )

  useEffect(() => {
      setSortedBlocks(blocks);
  }, [blocks]);

  if (!selectedCriteriaDetail) return <></>;
  let submitForReviewModal = <></>;
  if (!selectedCriteriaDetail.has_requested_review && canSubmit) {
    submitForReviewModal = (
      <WorkFlowReviewTaskModal workflowId={selectedCriteriaDetail.workflow} />
    );
  }
  if (
    selectedCriteriaDetail.has_requested_review &&
    selectedCriteriaDetail.has_requested_changes
  ) {
    submitForReviewModal = (
      <RequestRevisionButton
        workflowId={selectedCriteriaDetail.workflow}
        criteriaId={selectedCriteriaDetail.id}
        showNotification={() => setNotification(notificationConfig.revision)}
      />
    );
  }
  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (
      !result.destination ||
      result.destination.index === 0 ||
      result.destination.index === size(blocks) -1
    ) {
      return;
    }
    const items = reorder(
      sortedBlocks,
      result.source.index,
      result.destination.index
    );
    setSortedBlocks(items);
    const apiPayload = {
      blockId: result.draggableId,
      position: result.destination.index+1,
    };
    updateBlockPosition(apiPayload).then((resp: any) => {
      dispatch(getFundCriteriaDetail(parseInt(criteriaId)));
    })
  };

  return (
    <EligibilityContext.Provider value={getContextData(selectedCriteriaDetail.is_published)}>
      <CreationWizard
        heading={
          <>
            <Link
              to={`/${ADMIN_URL_PREFIX}/funds/${selectedCriteriaDetail?.fund_external_id}?view=setup&tab=eligibilityCriteria`}
            >
              {selectedCriteriaDetail.fund_name}
            </Link>{" "}
            / {selectedCriteriaDetail.name}
          </>
        }
        previewButtonText={"Preview"}
        previewButtonLink={`/admin/eligibility/${selectedCriteriaDetail.id}/preview`}
        submitForReviewModal={submitForReviewModal}
        addButton={!selectedCriteriaDetail.is_published && <AddBlockButton />}
        publishButton={
          <PublishCriteriaButton
            criteriaId={selectedCriteriaDetail.id}
            showNotification={() => setNotification(notificationConfig.publish)}
          />
        }
        leftPane={
          <DragDropContext onDragEnd={onDragEnd}>
            <CriteriaBlockList criteriaBlocks={sortedBlocks} />
          </DragDropContext>
        }
        middlePane={
          <DragDropContext onDragEnd={onDragEnd}>
            <CriteriaForm criteriaBlocks={sortedBlocks} isSmartDecisionFlow={isSmartDecisionFlow}/>
          </DragDropContext>
        }
        rightPane={
          <Comments
            wrapperClass="white-bg"
            workFlowId={selectedCriteriaDetail.workflow}
          />
        }
        is_publishable={selectedCriteriaDetail.is_publishable}
        isSmartDecisionFlow={isSmartDecisionFlow}
      />

      <NotificationModal
        title={notification?.title}
        showModal={notification?.show}
        handleClose={() => setNotification(notificationConfig.default)}
      >
        {notification?.msg}
      </NotificationModal>
    </EligibilityContext.Provider>
  );
};

export default EligibilityFormCreation;
