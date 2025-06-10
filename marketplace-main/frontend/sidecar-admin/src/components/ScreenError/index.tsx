import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { Title, Container, HeaderContainer } from "./styles";
import CancelIcon from "../../assets/images/cancel-icon.svg";
import { ADMIN_URL_PREFIX } from "../../constants/routes";

const ScreenError = () => {

  const reloadHomePage = () => {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Container>
      <HeaderContainer>
        <Title>Something went wrong</Title>
      </HeaderContainer>
      <Row>
        <Col md={12} className="my-4">
          <img src={CancelIcon} alt="Cancel icon" />
          <span className="px-3">
            The sidecar team has been notified, please try again later.
          </span>
        </Col>
      </Row>
      <Row>
        <Col md={2} className="my-4 px-1">
          <Link to={`/${ADMIN_URL_PREFIX}/funds`}>
            <Button
              variant="outline-primary btn-back"
              className="mb-2"
              onClick={reloadHomePage}
            >
              Go to homepage
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default ScreenError;
