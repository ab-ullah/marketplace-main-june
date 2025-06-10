import { FunctionComponent } from "react";
import { useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useGetFundDetailsQuery, useGetFundPermissionStatusQuery } from "../../api/rtkQuery/fundsApi";
import { Wrapper, H1, H3 } from "../StartPage/styles";
import NavableLoader from "../NavableLoader";

interface FundDetails {}

const getFundDetails = (Content: any) => {
  const FundDetails: FunctionComponent<FundDetails> = (props) => {
    let { externalId } = useParams<{ externalId: string }>();

    const { data: permission, isLoading: isLoadingPermissions } = useGetFundPermissionStatusQuery<{ data: any, isLoading: boolean }>(externalId);
    
    const {
      data: fundDetailsData,
      isLoading: isLoadingFundDetails,
      status: fundStatus,
    } = useGetFundDetailsQuery(externalId);

    if (isLoadingFundDetails || isLoadingPermissions)
      return (
        <>
          <Wrapper fluid hasLoader={true}>
            <NavableLoader />
          </Wrapper>
        </>
      );

    if (fundStatus === "rejected" || !permission?.status)
      return (
        <Wrapper fluid hasLoader={true}>
          <Row>
            <Col className="text-center">
              <H1 >404</H1>
              <H3>Page Not Found</H3>
            </Col>
          </Row>
        </Wrapper>
      );

    if (!fundDetailsData.is_published)
      return (
        <Wrapper fluid hasLoader={true}>
          <Row>
            <Col>
              <H1 className="text-center">Coming Soon!</H1>
            </Col>
          </Row>
        </Wrapper>
      );

    return <Content {...props} />;
  };

  return FundDetails;
};

export default getFundDetails;
