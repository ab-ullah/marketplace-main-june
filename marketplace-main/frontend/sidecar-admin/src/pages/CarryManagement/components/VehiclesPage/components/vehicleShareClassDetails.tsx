import { useEffect, useMemo, useState } from "react"
import API from '../../../../../api/backendApi';
import { Button, FormGroup, Modal } from "react-bootstrap";
import { FormFieldsWrapper, StyledCheckboxLabel } from "./styles";
import { OutlinedButton, SecondaryButton } from "../../styles";
import NavableLoader from "../../../../../components/NavableLoader";

const VehicleShareClassDetails = ({ handleSave, handleCloseModal, data }: any) => {

    const [shareClasses, setShareClasses] = useState<any>([])
    const [selectShareClasses, setSelectedShareClasses] = useState<any>([])
    const [isSingleShareClass, setIsSingleShareClass] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const sortedShareClasses = useMemo(() => {
        return shareClasses.sort((a: any, b: any) => {
            if (a.require_no_share_class === b.require_no_share_class) return 0;
            return a.require_no_share_class ? -1 : 1;
        });
    }, [shareClasses])

    const fetchShareClasses = async () => {
        setIsLoading(true)
        const response = await API.fetchCarryShareClasses();
        if (response.success) {
            setShareClasses(response.data)
            setIsLoading(false)
        }
    }

    const handleSingleShareClassSelect = (e: any) => {
        const checked = e.target.checked;
        if (checked) {
            setIsSingleShareClass(true);
            setSelectedShareClasses([e.target.value])
        }
        else {
            setIsSingleShareClass(false)
            setSelectedShareClasses([])
        }
    }

    const handleChange = (e: any) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedShareClasses([...selectShareClasses, e.target.value])
        }
        else {
            setSelectedShareClasses(
                selectShareClasses.filter((id: any) => id !== String(e.target.value))
            )
        }
    }

    const onSave = () => {
        if (selectShareClasses.length > 0) {
            handleSave(selectShareClasses)
        }
        else {
            setError('Please select at least one class')
        }
    }

    useEffect(() => {
        fetchShareClasses()
    }, [])

    useEffect(() => {
        if (data) {
            setSelectedShareClasses(data.classes.map((shareClass: any) => String(shareClass.template_share_class.id)))
        }
    }, [])

    useEffect(() => {
        if (selectShareClasses.length === 1) {
            const defaultClass = shareClasses.find((shareClass: any) => shareClass.id === Number(selectShareClasses[0]))
            defaultClass?.require_no_share_class && setIsSingleShareClass(true)
        }
    }, [selectShareClasses, shareClasses])

    if(isLoading) return <NavableLoader />

    return <>
        <FormFieldsWrapper>
        <h5 className="mt-3">
            Select share classes to include in vehicle
        </h5>
        {
            sortedShareClasses.map((shareClass: any, index: number) => <>
                {
                    shareClass.require_no_share_class ? <FormGroup>
                        <input type="checkbox"
                            value={shareClass.id}
                            checked={selectShareClasses.includes(String(shareClass.id))}
                            onChange={handleSingleShareClassSelect}
                        />
                        <StyledCheckboxLabel>
                            {shareClass.legal_name}
                        </StyledCheckboxLabel>
                    </FormGroup> : <FormGroup>
                        <input type="checkbox"
                            value={shareClass.id}
                            checked={selectShareClasses.includes(String(shareClass.id))}
                            onChange={handleChange}
                            disabled={isSingleShareClass}
                        />
                        <StyledCheckboxLabel>
                            {shareClass.legal_name}
                        </StyledCheckboxLabel>
                    </FormGroup>
                }
            </>)
        }
        {error && <div className="text-danger mt-2">{error}</div>}
        </FormFieldsWrapper>
        <Modal.Footer className="mt-3" style={{background: 'rgb(245, 247, 248)'}}>
            <OutlinedButton onClick={handleCloseModal} variant="secondary">
                Cancel
            </OutlinedButton>
            <SecondaryButton onClick={onSave}>
                Save
            </SecondaryButton>
        </Modal.Footer>
    </>
}

export default VehicleShareClassDetails;