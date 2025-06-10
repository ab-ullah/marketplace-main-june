import React, { useEffect, useMemo, useState } from 'react';
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import API from '../../../../api/backendApi'
import CreateDocument from './CreateDocument';
import { Button, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { fetchInvestorDocuments, fetchInvestorDocumentsFilters, fetchInvestorDocumentsNext } from '../../thunks';
import RsuiteTable, { ISortConfig } from '../../../../components/Table/RSuite';
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, find } from 'lodash';
import { selectInvestorDocuments, selectInvestorDocumentsFilters } from '../../selectors';
import { TableContainer } from '../../../../components/CompanyInfo/styles';
import { getColumns, getFieldInfo } from './config';
import { DocumentsContainer } from './styles';
import { UserActionDiv } from '../../../Users/styles';
import { ButtonAndSearchContainer, FilterBox, InputBox } from '../../../Funds/styles';
import { format } from 'date-fns';


const AdminDocuments = () => {

    const dispatch = useAppDispatch();
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentDelete, setDocumentDelete] = useState<any>(null); 
    const [searchValue, setSearchValue] = useState("")
    const [filterQuery,setFilterQuery]= useState("")
    const [sortQuery, setSortQuery] = useState("")
    const {results: investorDocuments, next} = useAppSelector(selectInvestorDocuments);
    const investorDocumentsFilters = useAppSelector(selectInvestorDocumentsFilters);

    
    const searchQuery = searchValue ? `q=${searchValue}` : ""
    // const investorDocsFilterQuery = `?${searchQuery}${sortQuery}&${filterQuery}`
    const investorDocsFilterQuery = `?${[searchQuery,sortQuery,filterQuery].filter(q=>q).join("&")}`

    const getfilteredDocuments = (data: any) => {
        return investorDocuments.filter((doc: any) => doc.fund === null || doc.investor === null);
    }

    useEffect(()=>{
      dispatch(fetchInvestorDocumentsFilters())
    },[dispatch])

    // useEffect(() => {
    //     dispatch(fetchInvestorDocuments())
    // }, [dispatch]);

    const debouncedFetch = debounce(() => {
      dispatch(fetchInvestorDocuments(investorDocsFilterQuery));
  }, 300); // Adjust the debounce delay as needed

  useEffect(() => {
      debouncedFetch();
      return () => {
          debouncedFetch.cancel();
      };
  }, [ investorDocsFilterQuery]);

    const handleFiltersChange=(_filters:any)=>{
      let queryArray = [];
      for (let key in _filters) {
        if(Array.isArray(_filters[key])){
        if (_filters[key].length > 0) {
          const paramName = getFieldInfo[key]?.paramName;
          if (paramName) {
            const values = _filters[key].join(",");
            queryArray.push(`${paramName}=${values}`);
          }
        }}
        else if(_filters[key] && Object.keys(_filters[key]).length>0 && Object.values(_filters[key])?.filter(d=>d).length>0){
          const paramName = getFieldInfo[key]?.paramName;

          const startParam = paramName.split(",")[0]
          const startDate =  format(_filters[key].startDate || 0, "yyyy-MM-dd")

          const endParam = paramName.split(",")[1]
          const endDate = format(_filters[key].endDate || 0, "yyyy-MM-dd")

          if(paramName && (startDate || endDate)){
            queryArray.push(`${startParam}=${startDate}&${endParam}=${endDate}`)
          }
        }
      }
      setFilterQuery(queryArray.join("&"));
    }

    const handleSortChange=(sortConfig:ISortConfig)=>{
      const orderSign = sortConfig.sortType==='desc' ? "-" : ""
      setSortQuery(`ordering=${orderSign}${sortConfig.sortColumn}`)
    }

    const onCreateOrUpdateDocument = () => {
        dispatch(fetchInvestorDocuments(investorDocsFilterQuery));
        setIsDocumentModalOpen(false);
        setSelectedDocument(null);
    };

    const openDocumentDetails = (id: number) => {
        const selectedDocument = find(investorDocuments, (doc) => doc.id === id);
        setSelectedDocument(selectedDocument);
        setIsDocumentModalOpen(true);
    }

    const toggleModal = () => {
        setIsDocumentModalOpen(!isDocumentModalOpen);
        setSelectedDocument(null);
    }

    const handleDocumentDelete = async (id: number, type: string) => { 
        await API.deleteInvestorDocument(id, type);
        setDocumentDelete(null);
        dispatch(fetchInvestorDocuments(investorDocsFilterQuery));
    }

    const confirmDocumentDelete = (data: any) => {
        setDocumentDelete(data);
    }

    const fetchNextPage = () => {
        dispatch(fetchInvestorDocumentsNext(next));
    }
    const memoizedCols = useMemo(
      () =>
        getColumns(
          openDocumentDetails,
          confirmDocumentDelete,
          investorDocumentsFilters
        ),
      [investorDocumentsFilters, investorDocuments]
    );
    
    return <DocumentsContainer>
      <div className='d-flex align-items-center mb-3'>
      <div className="contained">
      <ButtonAndSearchContainer>
        <FilterBox>
          <InputBox
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e: any) => setSearchValue(e.target.value)}
          />
          <SearchOutlinedIcon />
        </FilterBox>
      </ButtonAndSearchContainer>
    </div>
    <CreateDocument
        data={selectedDocument}
        showModal={isDocumentModalOpen} 
        onCreateOrUpdateDocumentCallback={onCreateOrUpdateDocument} 
        toggleModal={toggleModal}
        />
         
    </div>
    <div className="scroll-wrapper">
    {
       investorDocuments && <TableContainer>
       <InfiniteScroll
       dataLength={investorDocuments.length}
       next={fetchNextPage}
       hasMore={Boolean(next)}
       loader={<div>Loading...</div>}
       height={'850px'}
       scrollableTarget="rs-table-scrollbar"
       >
       <RsuiteTable
        height='850px'
        allowColMinWidth={false}
        wordWrap={true}
        rowSelection={false}
        defaultSortType={"desc"}
        columns={memoizedCols}
        data={getfilteredDocuments(investorDocuments)}
        callbackSelectedFilters={handleFiltersChange}
        callBackSortConfifg={handleSortChange}
        externalFiltering
        externalSorting
      />
       </InfiniteScroll>
        </TableContainer>
    }
    </div>
    <Modal show={Boolean(documentDelete)} onHide={() => {setDocumentDelete(null)}} size="lg">
      <Modal.Header>
        <Modal.Title>Delete Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete {documentDelete?.title}?
        <UserActionDiv>
                  <Button
                    variant="primary"
                    type="submit"
                    className={'filled'}
                    onClick={() => handleDocumentDelete(documentDelete?.id, documentDelete?.investor ? 'investor-document' : 'fund-document')}>
                    Delete
                  </Button>
                  <Button
                    variant="outline-primary"
                    type="button"
                    onClick={() => {setDocumentDelete(null)}}
                  >
                    Cancel
                  </Button>
                </UserActionDiv>
      </Modal.Body>
    </Modal>
    </DocumentsContainer>
}

export default AdminDocuments;