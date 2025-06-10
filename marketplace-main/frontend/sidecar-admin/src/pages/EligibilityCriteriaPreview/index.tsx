import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import API from '../../api/backendApi';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getFundCriteriaPreview } from './thunks';
import { ActiveBlockContainer, PageHeader, PreviewContainer } from './styles';
import {
  selectAnswers,
  selectFundCriteriaPreview,
  selectLogicFlowValues,
  selectSelectedOption,
  selectUserFileText,
} from './selectors';
import PreviewBlock from './components/PreviewBlock';
import Button from 'react-bootstrap/Button';
import { ADMIN_URL_PREFIX } from '../../constants/routes';
import { canViewUserDocumentsBlock } from './utils/userDocumentUtils';
import WorkFlowReviewTaskModal from '../../components/WorkFlowReviewTask/WorkFlowReviewModal';
import PublishCriteriaButton from '../../components/Publish/EligibilityCriteria';
import NotificationModal from '../../components/NotificationModal';
import { ICriteriaBlock } from '../../interfaces/EligibilityCriteria/criteria';
import {
  getCriteriaEligibility,
} from './utils/calculateEligibility';
import { hasAdminFilledBlocks } from './utils/hasAdminFilledBlocks';
import {
  resetToDefault,
  setRenderedBlockIds,
  setSelectedOption,
} from './eligibilityCriteriaPreviewSlice';
import { get } from 'lodash';


interface EligibilityCriteriaPreviewPageProps {
  criteriaIdProp?: string;
  reviewMode?: boolean;
}

const notificationConfig = {
  default: {
    show: false,
    title: '',
    msg: '',
  },
  publish: {
    show: true,
    title: 'Published',
    msg: `Congratulations! Your eligibility criteria has been published`,
  },
};

const EligibilityCriteriaPreviewPage: FunctionComponent<
  EligibilityCriteriaPreviewPageProps
> = ({ criteriaIdProp, reviewMode }) => {
  let { criteriaId } = useParams<{ criteriaId: string | undefined }>();
  if (!criteriaId) criteriaId = criteriaIdProp;
  const answers = useAppSelector(selectAnswers);
  const selectedOption = useAppSelector(selectSelectedOption);
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [notification, setNotification] = useState(notificationConfig.default);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentBlock, setCurentBlock] = useState<any>(null);
  const [previousBlocks, setPreviousBlocks] = useState<any>([]);
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);
  const logicFlowValues = useAppSelector(selectLogicFlowValues);
  const userDocumentText = useAppSelector(selectUserFileText);
  const is_smart_criteria = get(fundCriteriaPreview, 'is_smart_criteria')
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (criteriaId) dispatch(getFundCriteriaPreview(parseInt(criteriaId)));
    return () => {
      dispatch(resetToDefault());
    };
  }, []);

  const getNestedFieldsKeys = (customBlockId: number, blockId: number, fields: any[]) => {
    const keys: string[] = [];
    fields.forEach((field: any) => {
      field.nested_fields.forEach((nestedField: any) => {
        keys.push(`${customBlockId}-${blockId}-${nestedField.id}`);
      })
    })
    return keys
  }

  useEffect(() => {
    let keys: string[] = [];
    previousBlocks.forEach((block: ICriteriaBlock) => {
      if(block.block){
        keys.push(`${block.block.block_id}-${block.id}`);
      }
      else if(block.custom_block){
        keys.push(`${block.custom_block.id}-${block.id}`);
        keys = [...keys,  
          ...getNestedFieldsKeys(block.custom_block.id, block.id, block.custom_block.custom_fields)]
        
      }
    });
    dispatch(setRenderedBlockIds(keys));
  }, [dispatch, previousBlocks])

  const getFirstBlock = async () => {
    if (fundCriteriaPreview) {
      const response = await API.fetchNextBlock({
        is_preview: true,
        is_smart_view: fundCriteriaPreview.is_smart_criteria,
        eligibility_criteria_id: fundCriteriaPreview.id,
        response_json: {},
      });
      const block = get(response, 'next_block');
      if (block) setCurentBlock(block);
    }
  };

  useEffect(() => {
    getFirstBlock();
  }, [fundCriteriaPreview]);

  const updateEligibility = async () => {
    if (fundCriteriaPreview) {
      const activeLogicalFlowValues = {} as any;
      const allowedBlocks = [...previousBlocks]
      if (currentBlock) allowedBlocks.push(currentBlock)
      const filteredBlocks = allowedBlocks.filter((block: ICriteriaBlock) => {
        return !block.is_final_step && !block.is_user_documents_step && !block.is_custom_logic_block
      })
      console.log({filteredBlocks})
      filteredBlocks.map((block: any) => {
        const value = get(logicFlowValues, `${block.id}`, null)
        if (value !== null) {
          if (!value) console.log({block})
          activeLogicalFlowValues[block.id] = value
        }
      })
      const decision = await getCriteriaEligibility(
        fundCriteriaPreview,
        activeLogicalFlowValues
      );
      if (decision !== isEligible) setIsEligible(decision);
    }
  };

  useEffect(() => {
    updateEligibility();
  }, [fundCriteriaPreview, logicFlowValues]);

  if (!fundCriteriaPreview) return <></>;

const getValidBlock = (block: any) => {
    const finalStep = fundCriteriaPreview.criteria_blocks.find(block => block.is_final_step);
    const userDocumentStep = fundCriteriaPreview.criteria_blocks.find(block => block.is_user_documents_step);
    if(!is_smart_criteria){
      if(currentBlock.is_user_documents_step){
        return finalStep
      }
      else if(block && block.is_final_step && isEligible){
        return userDocumentStep
      }
    }
    if(block){
      if(!block.is_user_documents_step){
        return block
      }
      else if(block.is_user_documents_step && isEligible){
        return block
      }
      else if(block.is_user_documents_step && !isEligible){
        return finalStep
      }
      else {
        return finalStep
      }
    }
    else {
      return finalStep
    }

  }
  const goBack = () => {
    const lastBlock = previousBlocks.pop();
    const updatedBlocks = previousBlocks.filter(
      (block: { id: any }) => block.id !== lastBlock.id
    );
    setCurentBlock(lastBlock);
    setPreviousBlocks(updatedBlocks);
    dispatch(setSelectedOption(null));
  };

  const getOptionPayload = () => {
    if(!selectedOption) return {};
    const option = selectedOption[currentBlock.id];
    if (option && option?.isSmartBlock && get(currentBlock, 'custom_block.is_multiple_selection_enabled', false)) {
      return {
        [option.id]: true,
        [`${option.id}_option`]: option,
      };
    } else if (option) {
      return {
        value: option.id,
        [`${option.id}_option`]: option,
      };
    }
    else {
      return {};
    }
  };

  const goForward = async () => {
    if (fundCriteriaPreview && !currentBlock.is_user_documents_step) {
      const response = await API.fetchNextBlock({
        is_preview: true,
        is_smart_view: fundCriteriaPreview.is_smart_criteria,
        eligibility_criteria_id: fundCriteriaPreview.id,
        response_json: getOptionPayload(),
        block_id: currentBlock.id,
      });
      const block = get(response, 'next_block');
      if (block && Object.keys(block).length > 0) {
        setCurentBlock(getValidBlock(block));
        setPreviousBlocks([...previousBlocks, currentBlock]);
      } else {
        const docStep = fundCriteriaPreview.criteria_blocks.find(
          (block) => block.is_user_documents_step === true
        );
        if (docStep && canViewUserDocumentsBlock(true, userDocumentText)) {
          setCurentBlock(docStep);
          setPreviousBlocks([...previousBlocks, currentBlock]);
        } else {
          const finalStep = fundCriteriaPreview.criteria_blocks.find(
            (block) => block.is_final_step === true
          );
          if (finalStep) {
            setCurentBlock(finalStep);
            setPreviousBlocks([...previousBlocks, currentBlock]);
          }
        }
      }
    } else {
      const finalStep = fundCriteriaPreview.criteria_blocks.find(
        (block) => block.is_final_step === true
      );
      if (finalStep) {
        setCurentBlock(finalStep);
        setPreviousBlocks([...previousBlocks, currentBlock]);
      }
    }
    updateEligibility()
  };

  if (!currentBlock) return <></>;

  const getUrl = () => {
    return `${window.location.origin}/${ADMIN_URL_PREFIX}/eligibility/${fundCriteriaPreview.id}/preview`;
  };

  const canSubmit = hasAdminFilledBlocks(fundCriteriaPreview);
  return (
    <>
      <PreviewContainer fluid reviewMode={reviewMode}>
        {!reviewMode && (
          <PageHeader>
            <Link to={`/${ADMIN_URL_PREFIX}/eligibility/${criteriaId}/edit`}>
              <Button variant='outline-primary float-start btn-back-to-edit'>
                Back to edit
              </Button>
            </Link>
            {fundCriteriaPreview.is_publishable && (
              <PublishCriteriaButton
                criteriaId={fundCriteriaPreview.id}
                showNotification={() =>
                  setNotification(notificationConfig.publish)
                }
              />
            )}
            {!fundCriteriaPreview.has_requested_review && canSubmit && (
              <WorkFlowReviewTaskModal
                workflowId={fundCriteriaPreview.workflow}
                urlToCopy={getUrl()}
              />
            )}
          </PageHeader>
        )}
        <ActiveBlockContainer reviewMode={reviewMode}>
          {previousBlocks.length > 0 && (
            <Button
              variant='outline-primary btn-back'
              className='mb-2'
              onClick={goBack}
            >
              Back
            </Button>
          )}
          <PreviewBlock nextFunction={goForward} criteriaBlock={currentBlock} isEligible={isEligible}/>
        </ActiveBlockContainer>
      </PreviewContainer>
      <NotificationModal
        title={notification?.title}
        showModal={notification?.show}
        handleClose={() => setNotification(notificationConfig.default)}
      >
        {notification?.msg}
      </NotificationModal>
    </>
  );
};

export default EligibilityCriteriaPreviewPage;
