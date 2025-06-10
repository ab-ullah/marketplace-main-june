import React from "react";
import {useAuth0} from "@auth0/auth0-react";
import styled from "styled-components";


const StyledLoginButton = styled.button`
  padding: 16px 26px;
  background: #ECA106;
  border-radius: 40px;
  width: 150px;
  color: #FFFFFF;
  border: none;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
`

const LoginButton = () => {
  const {loginWithRedirect} = useAuth0();
  return (
    <StyledLoginButton
      onClick={() =>{
        localStorage.setItem('newLogin', 'true');
        loginWithRedirect(
          {
            appState: {
              returnTo: window.location.pathname
            }
          }
        )
      }
      }
    >
      Login
    </StyledLoginButton>
  );
};

export default LoginButton;