import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import Container from "react-bootstrap/Container";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {Carousel} from 'react-responsive-carousel';
import BtnLeft from "../../assets/images/welcome-carousel/btn_left.svg"
import BtnRight from "../../assets/images/welcome-carousel/btn_right.svg"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


const TextContainer = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  min-height: 360px;

  .welcome-heading {
    font-style: normal;
    font-weight: bold;
    font-size: 21px;
    line-height: 26px;
    letter-spacing: 0.02em;
    color: #020203;
    text-align: left;
    width: 100%;
  }

  .welcome-description {
    font-style: normal;
    font-weight: normal;
    font-size: 15px;
    line-height: 19px;
    letter-spacing: 0.02em;
    color: #020203;
    text-align: left;
  }
`

const ImageContainer = styled(Col)`
  display: flex;
  align-items: center;
`

const ItemContainer = styled(Container)`
  padding: 10px 60px 30px 60px;
`

const WelcomeCarousel: FunctionComponent = () => {
  return <Carousel
    autoFocus={true}
    autoPlay={false}
    infiniteLoop={true}
    showStatus={false}
    useKeyboardArrows={true}
    showThumbs={false}
    renderArrowPrev={(onClickHandler, hasPrev, label) =>
      hasPrev && (
        <button
          type="button"
          onClick={onClickHandler}
          title={label}
          style={{
            left: "0.2em",
            border: "none",
            backgroundColor: "transparent",
            position: 'absolute',
            top: '40%',
            zIndex: 400,
          }}
        >
          <img src={BtnLeft} alt="BtnLeft" />
        </button>
      )
    }
    renderArrowNext={(onClickHandler, hasPrev, label) =>
      hasPrev && (
        <button
          type="button"
          onClick={onClickHandler}
          title={label}
          style={{
            right: "0.2em",
            border: "none",
            backgroundColor: "transparent",
            position: 'absolute',
            top: '40%',
            zIndex: 400,
          }}
        >
          <img src={BtnRight} alt="BtnRight"/>
        </button>
      )
    }
  >
    <ItemContainer>
      <Row>
        <ImageContainer md={7}>
          <img src="/assets/images/welcome-carousel/dashboard_ss.png" height={'auto'} alt="dashboard"/>
        </ImageContainer>
        <Col md={5}>
          <TextContainer>
            <p className='welcome-heading'>The Dashboard</p>
            <p className='welcome-description'>
              This is your main dashboard. It’s an overall portfolio view of your investments. You’ll find a number of
              details regarding each investment and the aggregate total of your portfolio. <br/><br/> Please remember
              that
              reporting dates can vary so the values for each investment may not be as of the same date.
            </p>
          </TextContainer>
        </Col>
      </Row>
    </ItemContainer>
    <ItemContainer>
      <Row>
        <ImageContainer md={6}>
          <img src="/assets/images/welcome-carousel/notifications_ss.png" width={'442px'} alt="notifications"/>
        </ImageContainer>
        <Col md={6}>
          <TextContainer>
            <p className='welcome-heading'>Notifications & Documents</p>
            <p className='welcome-description'>
              This is your Documents & Notifications section. You can sort and search on any document.<br/><br/> The
              following
              information will be here: Statements, Capital Calls, Tax information, Agreements and all other investment
              related documents. You can sort and search by type or investment.
            </p>
          </TextContainer>
        </Col>
      </Row>
    </ItemContainer>
    <ItemContainer>
      <Row>
        <ImageContainer md={7}>
          <img src="/assets/images/welcome-carousel/investment_ss.png" width={'442px'} alt="investment"/>
        </ImageContainer>
        <Col md={5}>
          <TextContainer>
            <p className='welcome-heading'>Investment Details</p>
            <p className='welcome-description'>
              This is your Investment Details Screen. Click through on any investment from the dashboard to see more
              details related to your investment here.
            </p>
          </TextContainer>
        </Col>
      </Row>
    </ItemContainer>
  </Carousel>
};

export default WelcomeCarousel;
