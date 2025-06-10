import Modal from "react-bootstrap/Modal";
import API from '../../../../../api/backendApi';
import { Tab, StepPill, TabTitle } from "../../CarryPlansPage/components/CarryPlanModal/components/CustomTabsStepper/styles";
import { CARRY_VEHCILE_TABS, tabsStepperConfig } from "../constants";
import { useEffect, useState } from "react";
import { TabsContainer } from "../../../styles";
import VehicleDetailsForm from "./vehicleDetailsForm";
import VehicleShareClassDetails from "./vehicleShareClassDetails";
import { TabsWrapper } from "./styles";

export const VehicleModal = ({
    data,
    handleCloseModal,
    refetch,
}: any) => {
    const [activeTab, setActiveTab] = useState<any>(CARRY_VEHCILE_TABS.VEHICLE_DETAILS)
    const [draftVehicleDetails, setDraftVehicleDetails] = useState(data ? {
        common_name: data.common_name,
        legal_name: data.legal_name,
    } : {});

    const isActive = (key: string) => {
        if (activeTab) {
          return activeTab === key;
        } else return tabsStepperConfig[0].key === key;
    };

    const handleTabClick = (key: string) => {
        setActiveTab(key)
    };

    const handleNext = (values: any) => {
        setDraftVehicleDetails(values);
        setActiveTab(CARRY_VEHCILE_TABS.CARRY_SHARE_CLASSES)
    }

    const handleSave = async (shareClasses: any) => {
        let response = null;
        if(!data) {
            response = await API.createCarryVehicle({
                ...draftVehicleDetails,
                share_classes: shareClasses
            })
        }
        else {
            response = await API.updateCarryVehicle(data.id, {
                ...draftVehicleDetails,
                share_classes: shareClasses
            })
        }
        if((response)?.success) {
            handleCloseModal()
            refetch()
        }
    }

    useEffect(() => {
        setActiveTab(data ? CARRY_VEHCILE_TABS.CARRY_SHARE_CLASSES : CARRY_VEHCILE_TABS.VEHICLE_DETAILS)
    }, [data])

    return <>
     <Modal size={"lg"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton style={{ background: '#F5F7F8' }}>
            <Modal.Title>{data ? 'Update' : 'New'} Vehicle</Modal.Title>
        </Modal.Header>
        <TabsWrapper>
      {tabsStepperConfig.map((elem: any, index: any) => (
        <Tab style={{borderRight: index === 0 ? '1px solid #DFE5ED' : ''}} active={isActive(elem.key)} onClick={()=>handleTabClick(elem.key)}>
          <StepPill>Step {index + 1}</StepPill>
          <TabTitle>{elem.title}</TabTitle>
        </Tab>
      ))}
    </TabsWrapper>
        <Modal.Body style={{padding: '0'}}>
            {activeTab === CARRY_VEHCILE_TABS.VEHICLE_DETAILS && <VehicleDetailsForm 
            data={data} 
            handleNext={handleNext} 
            handleCloseModal={handleCloseModal} />}
            {activeTab === CARRY_VEHCILE_TABS.CARRY_SHARE_CLASSES && <VehicleShareClassDetails 
            data={data} 
            handleCloseModal={handleCloseModal}
            handleSave={handleSave} />}
        </Modal.Body>
     </Modal>
    </>
}

export default VehicleModal;