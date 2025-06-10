import { ReactNode } from 'react'
import { Cont, Title, Wrapper } from './styled'
import BackToApplication from "../../../../components/BackToApplication";
import {toLower} from "lodash";

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
	<Wrapper>
		<Title>{title}</Title>
		<Cont>
			{toLower(title) !== 'investor information' && <BackToApplication/>}
			{children}
		</Cont>
	</Wrapper>
)

export default Card
