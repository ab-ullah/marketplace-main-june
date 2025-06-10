// import Pic from 'assets/images/dummyPic.png'
import { createImageFromInitials, getRandomColor } from 'utils/image'
import {
	Cont,
	ProfilePic,
	DesignationSection,
	Name,
	Designation,
} from './styled'

interface IDetail {
	full_name: string
	profile_image: string
	designation: string
}

const IdentityCard = ({ details }: { details: IDetail }) => {
	const { full_name, profile_image, designation } = details

	return (
		<Cont>
			<ProfilePic
				src={
					profile_image?.length > 0
						? profile_image
						: createImageFromInitials(
								500,
								full_name,
								getRandomColor(),
						  )
				}
				alt='profile'
			/>

			<DesignationSection>
				<Name>{full_name}</Name>
				<Designation>{designation || '--'}</Designation>
			</DesignationSection>
		</Cont>
	)
}

export default IdentityCard
