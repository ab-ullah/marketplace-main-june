import { useEffect, useState, FC } from 'react'
import { Grid } from '@mui/material'
import { map } from 'lodash'
import { deepCopy } from 'utils/helpers'
import { splitArray } from 'utils/responsive'
import useWindowDimensions from 'utils/WindowDimensions'
import { IOpportunity } from 'interfaces/Opportunities'
import Card from './components/Card'
import SponsoredCard from './components/SponsoredCard'

interface FundCardLayoutProps {
	opportunities?: IOpportunity[]
	showSponsoredCard?: boolean
	keyPrefix: string
}

const FundCardLayout: FC<FundCardLayoutProps> = ({
	opportunities,
	showSponsoredCard = false,
	keyPrefix,
}) => {
	const { columns } = useWindowDimensions()
	const [data, setData] = useState<
		(IOpportunity | Record<string, never>)[][]
	>([])

	const placeSponsoredCard = (
		arr: (IOpportunity | Record<string, never>)[][],
		cols: number,
	) => {
		if (cols > 1) {
			arr[cols - 1].unshift({})
		} else {
			arr[cols - 1].splice(2, 0, {})
		}
	}

	useEffect(() => {
		if (opportunities) {
			const newArr: (IOpportunity | Record<string, never>)[] =
				deepCopy(opportunities)
			const splittedArray = splitArray(newArr, columns)
			if (showSponsoredCard) placeSponsoredCard(splittedArray, columns)
			setData(splittedArray)
		}
	}, [opportunities, columns])
	return (
		<div style={{ width: '100%' }}>
			<Grid
				container
				rowSpacing={1}
				columnSpacing={{ xs: 1, sm: 2, md: 3 }}
			>
				{data.length > 0 &&
					map(data, (opportunityList, i) => (
						<Grid
							key={`${keyPrefix}-col-${i}`}
							item
							xs={12}
							md={6}
							lg={4}
						>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '27px',
								}}
							>
								{map(opportunityList, opportunity =>
									opportunity?.external_id ? (
										<Card
											key={`${keyPrefix}-${opportunity.id}`}
											opportunity={opportunity}
										/>
									) : (
										<SponsoredCard key='sponsored' />
									),
								)}
							</div>
						</Grid>
					))}
			</Grid>
		</div>
	)
}

export default FundCardLayout

FundCardLayout.defaultProps = {
	opportunities: undefined,
	showSponsoredCard: false,
}
