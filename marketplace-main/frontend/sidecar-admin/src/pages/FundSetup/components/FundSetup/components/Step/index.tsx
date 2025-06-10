import React, {FunctionComponent} from "react";
import {H2, H3, Subtext} from "../../styles";
import styled from "styled-components";

export enum Status {
    Completed,
    StartNow,
    NotReady
}

export interface StepProps{
    texts: string[];
    stepNumber: string;
    subText: string;
    title: string;
    optional: boolean;
    status?: Status;
}

const Optional = styled.span`
    font-size: 18px;
    line-height: 48px;
`
interface StyledStatusProps{
    status?: Status;
}

const StyledStatus: FunctionComponent<StyledStatusProps> = ({ status }) => {
    let src;
    let color = "#4A47A3";
    let text = ''

    if (status === Status.Completed) {
        src="/assets/images/check_small_fund_setup.svg";
        text = "Completed"
        color = "#10AC84"
    } else if (status === Status.StartNow) {
        src = "/assets/images/auto_fix_fund_setup.svg";
        text = "Start Now"
    } else if (status === Status.NotReady) {
        src = "/assets/images/front_hand_fund_setup.svg";
        text = "Not Ready"
        color = "#808285"
    } else {
        return (
            <></>
        );
    }

    return (
        <div style={{float:"right"}} >
            <img src={src} width={'16px'} alt=""/>
            <span style={{paddingLeft: '3px', color: color}} >{text}</span>
        </div>
    );
};

const Step: FunctionComponent<StepProps> = ({texts, stepNumber, subText, title, optional, status}) => {
    return <div>
        <div>
            <H3>
                Step {stepNumber} {optional ?  <Optional>- Optional</Optional>: ""}
            </H3>
            <StyledStatus status={status}/>
        </div>
        <H2>
            {title}
        </H2>
        <Subtext>
            {subText}
        </Subtext>
        {texts.map((text, index) => {
            return <p key={index}>
                {text}
            </p>
        } )}

    </div>
}


export default Step;