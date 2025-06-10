import { FunctionComponent, useMemo } from "react";
import get from "lodash/get";
import isNil from "lodash/isNil";
import styled, { useTheme } from "styled-components";
import { useParams } from "react-router";
import { Params } from "../../pages/TaxForms/interfaces";
import { useGetCompanyInfoQuery } from "../../api/rtkQuery/commonApi";

interface ICompanyLogo {
  size?: "sm" | "md";
  logo?: string;
  className?: string;
  suffixText?: string;
}


const Wrapper = styled.div`
    text-align: left;
    display: flex;
    align-items: center;
`;


const LogoImg = styled.img<ICompanyLogo>`
  ${({ size }: any) => {
    if (size === "sm") return "width: 80px";
    if (size === "md") return "height: 26px";
  }};
  margin-right: 10px;
`;

const SuffixText = styled.div<ICompanyLogo>`
  font-size: ${({ size }: any) => {
    if (size === "sm") return "26px";
    if (size === "md") return "26px";
  }};
  color: #1F2D5D;
  font-family: 'Inter'; 
  font-weight: bold;
  /* text-transform: capitalize; */
  flex-grow: 1;
  position: relative;
`;


const CompanyLogo: FunctionComponent<ICompanyLogo> = ({ logo, size, className, suffixText }) => {
  const { externalId } = useParams<Params>();
  const { data: companyInfo } = useGetCompanyInfoQuery(externalId, { skip: !externalId });
  const theme = useTheme()
  const companyThemeLogo = theme.logo

  const companyLogo = useMemo(() => {
    if(logo)
      return logo;
    if(companyThemeLogo) return companyThemeLogo  
    if(get(companyInfo, 'company_logo'))
      return get(companyInfo, 'company_logo');
  }, [logo, companyInfo,companyThemeLogo]);

  return <Wrapper className={className}>
    <div>
      {!isNil(companyLogo) && (
        <LogoImg className="company-logo" size={size} src={companyLogo} alt="" />
      )}
    </div>
    {suffixText && (<SuffixText className="suffix-text" size={size}>{suffixText}</SuffixText>)}
  </Wrapper>;
};

CompanyLogo.defaultProps = {
  logo: "",
  size: "sm",
}

export default CompanyLogo;
