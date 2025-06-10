import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import {ICompanyFaq} from "../../../../interfaces/company";

const QuestionDiv = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`

const AnswerDiv = styled.div`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.02em;
  color: #020203;
  margin-top: 24px;

`

interface FAQSectionProps {
  faqs: ICompanyFaq[]
}


const FAQSection: FunctionComponent<FAQSectionProps> = ({faqs}) => {
  const topFaq = faqs.find(faq => faq.display_on_top);
  if (!topFaq) return <></>

  return <>
    <QuestionDiv>{topFaq.question}</QuestionDiv>
    <AnswerDiv>{topFaq.answer}</AnswerDiv>
  </>
};

export default FAQSection;
