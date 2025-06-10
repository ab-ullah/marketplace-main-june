// In future, we can move these blocks to API, to make
// them customizable via Admin portal
import documentIcon from '../../../../assets/images/fundMarketingPage/documents.svg';
import fundFactsIcon from '../../../../assets/images/fundMarketingPage/fund-facts.svg';
import footerIcon from '../../../../assets/images/fundMarketingPage/footer.svg';
import mainPageIcon from '../../../../assets/images/fundMarketingPage/main-page.svg'
import promoVideoImageIcon from '../../../../assets/images/fundMarketingPage/promo-video-image.svg'
import requestAllocationIcon from '../../../../assets/images/fundMarketingPage/request-allocation.svg';


export const MARKETING_PAGE_BLOCKS = [
  {
    name: 'Main block',
    position: 1,
    imgSrc: mainPageIcon
  },
  {
    name: 'Fund facts',
    position: 2,
    imgSrc: fundFactsIcon
  },
  {
    name: 'Promo video/image',
    position: 3,
    imgSrc: promoVideoImageIcon
  },
  {
    name: 'Documents',
    position: 4,
    imgSrc: documentIcon
  },
  {
    name: 'Request allocation',
    position: 5,
    imgSrc: requestAllocationIcon
  },
  {
    name: 'Footer',
    position: 6,
    imgSrc: footerIcon
  },
  {
    name: 'Contact',
    position: 7,
    imgSrc: mainPageIcon
  }
]