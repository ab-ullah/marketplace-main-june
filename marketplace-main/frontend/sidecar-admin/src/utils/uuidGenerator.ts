import {v4} from 'uuid';

export const generateUUid = () => {
  return v4().split('-').join('')
}