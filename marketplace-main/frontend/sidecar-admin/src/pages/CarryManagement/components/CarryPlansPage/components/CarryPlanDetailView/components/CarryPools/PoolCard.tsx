import { isEmpty, isEqual, map, truncate } from "lodash";
import TooltipWrapper from "../../../../../../../../components/Tooltip";
import { limitCarryDecimalPlaces } from "../../../../../../../../utils/getValue";
import PoolOptionsMenu from "./PoolOptionsMenu";
import { CardWrapper, PointsContainer, Text, Title, TitleContainer } from "./styles";
import FilePreviewModal from "../../../../../../../../components/FilePreviewModal";

const SubpoolCard = ({ subpool, onRenameCarryPool, onDeletePool, onTransferPoints }:
    { subpool: Record<string, any>, onRenameCarryPool: any, onDeletePool: any, onTransferPoints: any }) => {
    const { id, name, vehicle_name, template_share_class_name, bps, allocated, un_allocated, vesting_schedule, carry_documents } = subpool;

    const truncateOptions ={ length:24}
    const truncatedText = (str:string)=> truncate(str,truncateOptions)
    const tooltipProps =(str:string)=>{
        return{
        enable: str?.length > truncateOptions.length,
        text: str
    }}

    return (
        <CardWrapper md={2} xs={6}>
            <div>
                <TitleContainer>
                    <TooltipWrapper {...tooltipProps(name)}>
                    <Title>{truncatedText(name)}</Title>
                    </TooltipWrapper>
                   
                    <PoolOptionsMenu 
                    poolId={id}
                    pool={subpool}
                    onRenameCarryPool={onRenameCarryPool} 
                    onDeletePool={onDeletePool} 
                    onTransferPoints={onTransferPoints} />
                </TitleContainer>

                <TooltipWrapper {...tooltipProps(vehicle_name)}>
                <Text>{truncatedText(vehicle_name)}</Text>
                </TooltipWrapper>

                <TooltipWrapper {...tooltipProps(template_share_class_name)}>
                <Text>{truncatedText(template_share_class_name)}</Text>
                </TooltipWrapper>

                <TooltipWrapper {...tooltipProps(vesting_schedule?.name)}>
                <Text>{truncatedText(vesting_schedule?.name)}</Text>
                </TooltipWrapper>
                
                
            </div>
            {!isEmpty(carry_documents) &&
                <div>
                <Title>Docs</Title>
                {map(carry_documents,(doc:any)=>
                   <FilePreviewModal
                      documentId={doc?.document?.document_id}
                      documentName={doc?.document?.title}
                      customDisplayButton={<div style={{cursor:'pointer', textDecoration:'underline'}}>{truncate(doc?.document?.title)}</div>}
                      showPreviewIcon={false}
                    />
                    )}
                </div>
            }
            <div>
                <Title>Total Points: {limitCarryDecimalPlaces(bps)}</Title>
                <PointsContainer>
                    <Text color="#607d8b">Allocated</Text>
                    <Text color="#10AC84">{limitCarryDecimalPlaces(allocated)}</Text>
                </PointsContainer>
                <PointsContainer>
                    <Text color="#607d8b">Unallocated</Text>
                    <Text color="#F5A61D">{limitCarryDecimalPlaces(un_allocated)}</Text>
                </PointsContainer>
            </div>
        </CardWrapper>
    );
};

export default SubpoolCard;