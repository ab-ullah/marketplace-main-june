import {FC, memo} from 'react'

interface IIndicationOfInterestHeaderProps {
  fundName: string
  investmentPeriod?: string
}

const IndicationOfInterestHeader: FC<IIndicationOfInterestHeaderProps> = ({
                                                                            fundName,
                                                                            investmentPeriod
                                                                          }) => {
  return <>
    <h1 className='mt-4 mb-4'>Thanks for expressing interest in {fundName}.</h1>
    <h5>This fund will open for investment {investmentPeriod ? `in ${investmentPeriod}.` : 'soon.'} Please complete the details below to indicate interest in this investment.</h5>
    <div className='mt-4 mb-4'>
      <p className='m-0'>
      Please note, this is not a binding or confirmed commitment.
      </p>
    </div>
  </>
}

export default memo(IndicationOfInterestHeader)