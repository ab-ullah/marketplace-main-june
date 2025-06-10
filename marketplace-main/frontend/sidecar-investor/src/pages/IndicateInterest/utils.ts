import get from "lodash/get";
import filter from "lodash/filter";
import {KYCState} from "../KnowYourCustomer/interfaces";
import { isNil } from "lodash";

const getLeverageOptions = (kycRecord: KYCState, leverageOptions:  {amount: number, description: string}[], maxLeverage: number | null | undefined) => {
    const maxLeverageRatio = !isNil(maxLeverage) ? maxLeverage : get(kycRecord, 'applicationRecord.max_leverage_ratio', undefined)
    let filteredLeverages = []
    for (const leverageOption of leverageOptions){
        const amount = (leverageOption.amount > 0) ? `${leverageOption.amount}:1` : "None"
        const label = leverageOption.description ? `${amount} - ${leverageOption.description}` : amount
        if(filteredLeverages){
            filteredLeverages.push({
                value: JSON.stringify({description: leverageOption.description, amount: leverageOption.amount}),
                label: label,
                multiple: leverageOption.amount,
            })
        }
    }
    filteredLeverages = filteredLeverages.sort(
        function(a,b){
            const x = a.multiple;
            const y = b.multiple;
            return x-y;
        }
    )
    
    if (!isNil(maxLeverageRatio) && maxLeverageRatio > -1)
        return filter(
            filteredLeverages,
            (option) => option.multiple <= maxLeverageRatio
        );
    return filteredLeverages;
};

export default getLeverageOptions;