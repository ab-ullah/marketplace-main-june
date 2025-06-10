import * as Yup from "yup";
import moment from "moment";


export const VALIDATION_SCHEMA = Yup.object({
  callAmount: Yup.number().positive(),
  dueDate: Yup.date().required()
});

export const INITIAL_VALUES = {
  callAmount: 0,
  dueDate: moment().toDate()
};