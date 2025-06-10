import {INVESTOR_URL_PREFIX,MP_ORIGIN} from "../constants/routes";
import { advisorSelectedHexParam } from "./advisorSelected";

export const getHomepageUrl=(companyPrefix:string)=>{

    const mpParam = localStorage.getItem('mpParam');
    const InvestorOrigin= window.location.origin
    if(mpParam && MP_ORIGIN){
        return `${MP_ORIGIN}${companyPrefix}?${advisorSelectedHexParam()}`
    }
    else {
        return `${InvestorOrigin}${companyPrefix}/${INVESTOR_URL_PREFIX}/start`
    }
}

export const isApplicationPage = (): boolean => {
    if (typeof window === "undefined") return false; // Ensure it's running in a browser
  
    const url = window.location.pathname;
    const regex = /\/funds\/[^/]+\/application/;
  
    return regex.test(url);
  };