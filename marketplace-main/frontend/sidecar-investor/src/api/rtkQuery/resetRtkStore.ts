import {api as fundsApi} from './fundsApi';

export const resetRtkStore = (dispatch: any) => {
  dispatch(fundsApi.util.resetApiState())
}