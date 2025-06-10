import {useMediaQuery} from 'react-responsive'

export const useScreenWidth = () => {
  const isSmall = useMediaQuery({query: '(max-width: 767px)'})

  return {
    isSmall
  };
};

export default useScreenWidth;
