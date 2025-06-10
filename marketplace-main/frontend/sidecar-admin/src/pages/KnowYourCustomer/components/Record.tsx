import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import sortBy from "lodash/sortBy";
import {Card, DocumentAnswer, KYCRecordResponse} from '../../../interfaces/workflows';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import {fetchGeoSelector} from '../thunks';
import {selectKYCState, selectTaxRecords, selectApplicationInfo} from '../selectors';
// import {fetchComments} from '../thunks';
import {addRecordDocuments} from '../kycSlice';
import {CardContainer, CardTitle, SchemaContainer} from '../styles';
import {parseCardSchema} from '../utils';
import Question from './Question';
import API from '../../../api/backendApi';
import { KYC_ENTITY_TYPES, AML_KYC_ENTITIES_WORKFLOW, LOOKUP_TYPES, ELIGIBIBLE_INVESTOR_FIELDS, ELIGIBILITY_CARD_TITLE } from '../constants'
import VehicleDetails from './VehicleDetails';
import { get } from 'lodash';

interface RecordProps {
  record: KYCRecordResponse;
  eligibilityCard: Card | null;
  investmentAmountCard: Card | null;
  eligibilityCardFetched: boolean;
}

const Record: FunctionComponent<RecordProps> = (
  {
    record,
    eligibilityCard,
    investmentAmountCard,
    eligibilityCardFetched
  }
) => {
  const dispatch = useAppDispatch();
  const {workflows, kycRecordParticipants} = useAppSelector(selectKYCState);
  const appInfo = useAppSelector(selectApplicationInfo);
  const {geoSelector} = useAppSelector(selectTaxRecords)
  const [applicationCards, setApplicationCards] = useState<any>([]);
  const [participantRecordWithDocuments, setParticipantRecordWithDocuments] = useState<any>(kycRecordParticipants);
  const [recordWithDocuments, setRecordWithDocuments] = useState<KYCRecordResponse>(record);
  const [documentsHaveBeenFetched, setDocumentsHaveBeenFetched] = useState<boolean>(false);
  
  const workflow = useMemo(() => {
    if (!workflows) return null;
    return workflows.find(w => w.slug === record.workflow.slug);
  }, [workflows, record.workflow.slug]);

  useEffect(() => {
    dispatch(fetchGeoSelector())
  }, [])

  // useEffect(() => {
  //   dispatch(fetchComments(record.id));
  // }, [dispatch, record.id]);


  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const documents = await API.getDocumentsInKYCRecord(record.id, appInfo?.id);
        const documentAnswers = {} as { [key: string]: DocumentAnswer[] };
        documents.forEach(({ document: { title, document_id }, field_id }) => {
          if(!documentAnswers[field_id]) 
          documentAnswers[field_id] = [{title,document_id}];
          else
          documentAnswers[field_id].push({title,document_id})
        })
        setRecordWithDocuments({...record, ...documentAnswers});
        dispatch(addRecordDocuments({recordId: record.id, documents}));
      } catch (e) {
        console.error(e);
      } finally {
        setDocumentsHaveBeenFetched(true);
      }
    };
    fetchDocuments();
  }, [dispatch, record]);

  useEffect(() => {
    const fetchParticipantDOcuments = async () => {
      if(workflow && record && kycRecordParticipants){
        let updatedKycParticipantRecord = [...kycRecordParticipants];
        kycRecordParticipants.forEach( async (participantRecord: { id: number; }, index: number) => {
          const participantDocs = await API.getParticipantDocuments(workflow.slug, record.id, participantRecord.id, appInfo?.id)
          participantDocs.forEach(({ document: { title, document_id }, field_id }) => {
            if(!updatedKycParticipantRecord[index][field_id])
            updatedKycParticipantRecord[index] = {
              ...updatedKycParticipantRecord[index],
              [field_id]: [{title,document_id}]
            }
            else 
            updatedKycParticipantRecord[index][field_id].push({title,document_id})
          })
          dispatch(addRecordDocuments({recordId: participantRecord.id, documents: participantDocs}));
        });
        setParticipantRecordWithDocuments(updatedKycParticipantRecord)
      }
    }
    fetchParticipantDOcuments();
  }, [dispatch, kycRecordParticipants])

  useEffect(() => {
    if(workflow?.cards && recordWithDocuments){
      let workflowCards = [...workflow?.cards];
      const participantInfoCard = workflowCards.filter(({ name }) => name === 'Participant information')
      workflowCards = workflowCards.filter(({ name }) => name !== 'Participant information')
      let sortedCards = sortBy(workflowCards, (o) => {
        return [o.order, o.name];
      });
      if (investmentAmountCard) sortedCards.push(investmentAmountCard)
      if (eligibilityCard && eligibilityCard?.schema.length > 0) sortedCards.push(eligibilityCard)
      setApplicationCards([
        ...sortedCards,
        ...(participantInfoCard ? participantInfoCard: [])
      ])
    }
  }, [ workflow?.cards, eligibilityCard, investmentAmountCard])

  const  getIsShowProofOfAddressField = (participantRecord: any) => {
    const investorName = `${get(recordWithDocuments, 'first_name')} ${get(recordWithDocuments, 'last_name')}`;
    const participantName = `${get(participantRecord, 'first_name')} ${get(participantRecord, 'last_name')}`;
    if(investorName.trim() === participantName.trim()) return false;
    return true;
  }


  if (!workflow || !recordWithDocuments) return <></>;

  const cards = [...applicationCards]
  
  if (!workflow || !recordWithDocuments || !cards) return <></>;
  return <>
    {
      cards.length > 0 && cards && cards.map(card => {
        if(card.name !== ELIGIBILITY_CARD_TITLE && !appInfo?.investment_detail.is_eligible) return null
        let schema = parseCardSchema(card.schema, recordWithDocuments);
        if(card.name === ELIGIBILITY_CARD_TITLE) schema = card.schema;
        return (
          <CardContainer key={card.name}>
            <CardTitle>{card.name}</CardTitle>
            {
              card.is_repeatable ? <>
                {
                  participantRecordWithDocuments?.map((participantRecord: KYCRecordResponse) => {
                    const schema = parseCardSchema(card.schema, participantRecord);
                    return <SchemaContainer>
                      {schema.map(question => {
                        const answer = participantRecord[question.id]
                        if(!question.submitted_answer && !answer && answer !== 0 && question.type !== LOOKUP_TYPES.file_upload) return null;
                        if(question.id === 'proof_of_address' && !getIsShowProofOfAddressField(participantRecord)) return null;
                        return <Question
                          key={question.id}
                          question={question}
                          answer={answer}
                          isParticipant={true}
                          moduleId={participantRecord.id}
                          record={record}
                          questionIdPrefix={`participant_${participantRecord.id}_`}
                        />
                      })}
                    </SchemaContainer>
                  })
                }
              </> : <SchemaContainer>
              {schema.map(question => {
                const answer = recordWithDocuments[question.id];
                if (!question.submitted_answer && !answer && answer !== 0 && question.type !== LOOKUP_TYPES.file_upload) return null;
                return <Question key={question.id} question={question} answer={answer} record={record}/>
              })}
            </SchemaContainer>
            }
            {card.card_id === "aml-kyc-individual-personal-information" && <VehicleDetails appInfo={appInfo} />}
          </CardContainer>
        )
      })
    }
    {!documentsHaveBeenFetched && <h4>Fetching documents...</h4>}
    {!eligibilityCardFetched && <h4>Fetching Eligibility Response...</h4>}
  </>
}

export default Record;