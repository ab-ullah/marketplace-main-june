import styled from "styled-components";

export const ContainerDiv = styled.div`
  text-align: center;
  background: linear-gradient(180.04deg, #413C69 0.04%, #5E55A2 87.11%);
  height: calc(100vh - 335px);
  min-height: 450px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const ImageDiv = styled.div`
  img {
    height: 40px;
  }
`

export const WelcomeTextDiv = styled.div`
  font-family: Quicksand Bold;
  font-style: normal;
  font-size: 32px;
  line-height: 40px;
  margin-top: 60px;
  margin-bottom: 60px;
  color: #FFFFFF;
`

export const BottomParentContainer = styled.div`
  height: 25vh;
  background: #ECECEC;
  text-align: center;
  padding: 30px;
  min-height: 300px;
  
`

export const TextBox = styled.div`
  width: 50%;
  margin-left: 25%;
`



export const FooterLink = styled.a`
  font-family: Quicksand Bold;
  font-style: normal;
  font-size: 14px;
  line-height: 20px;
  font-feature-settings: 'liga' off;
  color: #020203;
  mix-blend-mode: normal;
  margin-left: 36px;
  text-decoration: none;
  cursor: pointer;
`




export const SignedOutFooter = styled.footer`
  background: #ECECEC;
  color: #1F1F20;
  padding: ${props => `${props.theme.baseLine * 2}px`};
  min-height: 300px;

  .nav {
    margin: ${props => `${props.theme.baseLine}px 0 ${props.theme.baseLine * 1.5}px`};
    justify-content: center;

    .nav-item {

      a {
        font-family: 'Quicksand Bold';
        text-decoration: underline;
        font-style: normal;
        font-size: 14px;
        line-height: 20px;
        font-feature-settings: 'liga' off;
        color: #020203;
        mix-blend-mode: normal;
        cursor: pointer;
      }

      &:first-child {

        a {
          padding-left: 0;
        }
      }
    }
  }

  p {
    margin-bottom: ${props => `${props.theme.baseLine}px`};
    
    a {
      font-family: 'Quicksand Bold';
      text-decoration: underline;
      font-style: normal;
      font-size: 14px;
      line-height: 20px;
      font-feature-settings: 'liga' off;
      color: #020203;
      mix-blend-mode: normal;
      cursor: pointer;
    }
  }
  
  .copyright-text {
    text-align: center;
  }

  @media screen and (max-width: 1199px) {
    .nav {
      display: block;

      .nav-item {
        a {
          padding-left: 0;
          text-align: center;
        }
      }
    }
  }
`