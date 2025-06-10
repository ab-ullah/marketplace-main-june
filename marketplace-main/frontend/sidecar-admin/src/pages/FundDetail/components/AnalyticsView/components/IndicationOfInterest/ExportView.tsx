import React, {FunctionComponent} from 'react'
import {TabContentContainer} from "../../styles";
import {HeaderWithButtons} from '../../../../../../components/Header'
import Button from "react-bootstrap/Button";
import API from "../../../../../../api"
import {useParams} from "react-router-dom";
// @ts-ignore
import {useJsonToCsv} from 'react-json-csv';


interface ExportIndicationOfInterestsProps {

}

export const exportInterest = async(externalId: string, saveFunction: (arg0: any) => any) => {
  const data = await API.exportIndicationOfInterestAnswers(externalId)
  const csvFields = {} as any;
  data['fields'].forEach((header: string) => csvFields[header] = header)
  saveFunction({data: data['rows'], fields: csvFields, filename: data['file_name']})
}

const ExportIndicationOfInterests: FunctionComponent<ExportIndicationOfInterestsProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();
  const {saveAsCsv} = useJsonToCsv();

  const onExport = async() => {
    await exportInterest(externalId, saveAsCsv)
  }

  return <TabContentContainer>
    <HeaderWithButtons title='Indication of Interest' isSubtitle>
    </HeaderWithButtons>
    <Button variant={'primary'} className={'mt-4'} onClick={onExport}>Export Answers</Button>
  </TabContentContainer>
}

export default ExportIndicationOfInterests