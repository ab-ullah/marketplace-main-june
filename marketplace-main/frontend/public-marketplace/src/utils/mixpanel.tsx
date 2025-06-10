import { get } from "lodash";
import mixpanel from 'mixpanel-browser';

export const getCompaniesList = (companyUsers: any) => {
    const list: any = {
        companyNames: [],
        companySlugs: []
    }
    companyUsers.forEach((user: any) => {
        list.companyNames.push(get(user, 'company.name'));
        list.companySlugs.push(get(user, 'company.slug'));
    });
    return list
}

export const logMixPanelEvent = (eventName: string, companyName = undefined, companySlug = undefined) => {
    const userInfo = localStorage.getItem('userInfo');
    if(!userInfo) return
    const {companyNames, companySlugs} = getCompaniesList(get(JSON.parse(userInfo), 'company_users', []));
    if(companyNames && companySlugs){
        const payload: any = {
            companyNames: companyNames,
            companySlugs: companySlugs,
            environment: process.env.REACT_APP_ENVIRONMENT,
            app: 'Public Marketplace'
        }
        if(companyName) payload.companyName = companyName;
        if(companySlug) payload.companySlug = companySlug;
        mixpanel.track(eventName, payload);
    }
}