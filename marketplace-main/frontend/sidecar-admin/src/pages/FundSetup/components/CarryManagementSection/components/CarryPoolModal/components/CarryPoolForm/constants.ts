import * as Yup from "yup";

export const INITIAL_VALUES={
    name:'',
    bps:0
}

export const validationSchema = (minBps: number, maxBps?: number) => {
    let bpsValidation = Yup.string()
      .test(
        'limit',
        maxBps
          ? `Enter between ${minBps} & ${maxBps}`
          : `Enter a value greater than or equal to ${minBps}`,
        value => {
          const parsedValue = parseFloat(value || '0');
          return (maxBps ? parsedValue >= minBps && parsedValue <= maxBps : parsedValue >= minBps);
        }
      )
      .required('Required');
  
    return Yup.object({
      name: Yup.string().required('Required'),
      bps: bpsValidation,
    });
  };