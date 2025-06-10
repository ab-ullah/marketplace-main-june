import { useEffect, useState } from "react"
import RsuiteTable from '../../../../components/Table/RSuite';
import API from '../../../../api/backendApi';
import NavableLoader from "../../../../components/NavableLoader";
import { PageContainer, Title, TopButton, TopRow } from "../styles";
import { Breadcrumb } from "react-bootstrap";
import { getColumns } from "./constants";
import { ContentWrapper, LeftIndentRsuite } from "./styled";
import ShareClassModal from "./components/shareClassModal";
import { useHistory } from "react-router-dom";

export const ShareClasses = () => {
    const history = useHistory()
    const [shareClasses, setShareClasses] = useState([])
    const [selectedShareClass, setSelectedShareClass] = useState(null)
    const [isShareClassModalOpen, setIsShareClassModalOpen] = useState(false)

    const fetchShareClasses = async () => {
        const response = await API.fetchCarryShareClasses();
        if(response.success) {
            setShareClasses(response.data)
        }
    }

    const handleOpenShareModal = (record: any = null) => {
        setSelectedShareClass(record)
        setIsShareClassModalOpen(true)
    }

    const handleClose = () => {
        setIsShareClassModalOpen(false)
        setSelectedShareClass(null)
    }

    const handleRedirect = () => {
        history.push('/admin/carryManagement?tab=funds')
    }


    useEffect(() => {
        fetchShareClasses()
    }, [])

    if(!shareClasses) return <NavableLoader />

    return <>
        <PageContainer>
        <TopRow>
        <Title>Share Classes</Title>
      </TopRow>
      <Breadcrumb>
        {["Carry Management", "Share Classes"]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item
              onClick={() => { i === 0 && handleRedirect()}}
              key={elem}
            >
              {elem}
            </Breadcrumb.Item>
          ))}
      </Breadcrumb>
      <div className="d-flex justify-content-end">
        <TopButton 
          onClick={() => setIsShareClassModalOpen(true)}
          variant="primary">
                Create New Share Class
        </TopButton>
      </div>
      <ContentWrapper>
      <LeftIndentRsuite>
      <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(handleOpenShareModal)}
          data={shareClasses.filter((shareClass: any) => !shareClass.require_no_share_class)}
          wordWrap={true}
          rowHeight={50}
          rowBordered
        />
      </LeftIndentRsuite>
      </ContentWrapper>
      <ShareClassModal 
        isOpen={isShareClassModalOpen} 
        data={selectedShareClass}
        refetch={fetchShareClasses}
        handleCloseModal={handleClose} />
    </PageContainer>
    </>
}