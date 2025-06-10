import * as Yup from "yup";

export const INITIAL_VALUES={
    vesting_calculation_date:'',
    vesting_start_date:'',
   vesting_id:''
}

export const validationSchema =(minBps:number, maxBps:number)=> Yup.object({
    vesting_calculation_date: Yup.string().required("Required"),
    vesting_start_date: Yup.string().required("Required"),
    vesting_id: Yup.string().required("Required"),
    
})