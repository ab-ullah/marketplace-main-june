import * as Yup from "yup";

export const INITIAL_VALUES={
    name:'',
    bps:0,
    email:''
}

export const validationSchema =(minBps:number, maxBps:number)=> Yup.object({
    name: Yup.string(),
    email: Yup.string(),
    bps: Yup.string().test(
        'min-limit',
        `Enter between ${minBps} & ${maxBps}`,
        value =>
            parseFloat((value as string)) <= maxBps && parseFloat((value as string)?.split('.')[0])>=minBps,
    ),
})