import { get } from "lodash";
import mixpanel from 'mixpanel-browser';

export const logMixPanelEvent = (eventName: string) => {
    const userInfo = localStorage.getItem('userInfo');
    if(!userInfo) return;
    const userDetails = JSON.parse(userInfo);
    if(userDetails){
        mixpanel.track(eventName, {
            company: get(userDetails, 'company.name'),
            companySlug: get(userDetails, 'company.slug'),
            environment: process.env.REACT_APP_ENVIRONMENT,
            app: 'Admin'
        });
    }
}