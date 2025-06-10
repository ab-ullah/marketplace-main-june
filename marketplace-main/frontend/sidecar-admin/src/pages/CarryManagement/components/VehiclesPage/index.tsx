import { Breadcrumb } from "react-bootstrap"
import RsuiteTable from '../../../../components/Table/RSuite';
import API from '../../../../api/backendApi';
import { PageContainer, Title, TopButton, TopRow } from "../styles"
import { ContentWrapper, LeftIndentRsuite } from "../ShareClasses/styled";
import { getColumns } from "./constants";
import { useEffect, useState } from "react";
import VehicleModal from "./components/vehicleModal";
import { Cont } from "../VestingTool/styles";
import { Body, Header, HeaderTitle } from "../StatsTable/styles";
import VehicleDetails from "./components/vehicleDetails";
import { VEHICLE_ID_PARAM } from "../../constants";

const Vehicles = () => {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [vehcileToView, setVehicleToView] = useState<any>(null)
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

    const fetchVehicles = async () => {
        const response = await API.fetchCarryVehicles();
        if (response.success) {
            setVehicles(response.data)
        }
    }

    const onSelectVehicle = (row: any) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set(VEHICLE_ID_PARAM, String(row.id));
        window.history.replaceState({}, "", `?${searchParams.toString()}`);
        setVehicleToView(row);
    }

    const onAddShareClasses = () => {
        setIsVehicleModalOpen(true);
    }

    const resetVehicleParam = () => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete(VEHICLE_ID_PARAM);
        window.history.replaceState({}, "", `?${searchParams.toString()}`);
        setVehicleToView(null);
      };

    useEffect(() => {
        fetchVehicles()
    }, [])

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const vehicleId = searchParams.get(VEHICLE_ID_PARAM);
        if (vehicleId) {
            const selectedVehicle = vehicles.find((vehicle: any) => vehicle.id === Number(vehicleId))
            setVehicleToView(selectedVehicle)
        }
    }, [vehicles])

    return <PageContainer>
        <TopRow>
            <Title>{vehcileToView ? vehcileToView.legal_name : 'Vehicles'}</Title>
        </TopRow>
        <Breadcrumb>
            {["Carry Management", "Vehicles", vehcileToView && vehcileToView.legal_name]
                .filter((elem) => elem)
                .map((elem, i) => (
                    <Breadcrumb.Item
                    onClick={() => (i === 1 ? resetVehicleParam() : null)}
                        key={elem}
                    >
                        {elem}
                    </Breadcrumb.Item>
                ))}
        </Breadcrumb>
        {
            !vehcileToView ? <>
                <div className="d-flex justify-content-end">
                    <TopButton
                        onClick={() => { setIsVehicleModalOpen(true) }}
                        variant="primary">
                        Create New Vehicle
                    </TopButton>
                </div>
                <ContentWrapper>
                    <LeftIndentRsuite>
                        <RsuiteTable
                            height="400px"
                            allowColMinWidth={true}
                            rowSelection={false}
                            columns={getColumns((row: any) => onSelectVehicle(row))}
                            data={vehicles}
                            wordWrap={true}
                            rowHeight={50}
                            rowBordered
                        />
                    </LeftIndentRsuite>
                </ContentWrapper>
            </> :
                <VehicleDetails vehicle={vehcileToView} onAddShareClasses={onAddShareClasses} />
        }
        {isVehicleModalOpen &&
        <VehicleModal
            data={vehcileToView}
            handleCloseModal={() => setIsVehicleModalOpen(false)}
            refetch={fetchVehicles}
        />
        }
    </PageContainer>
}

export default Vehicles;