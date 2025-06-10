import { ReactNode, ButtonHTMLAttributes } from 'react'
import { SxProps } from '@mui/system'
import CircularProgress from '@mui/material/CircularProgress'
import _ from 'lodash'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { SvgIconTypeMap } from '@mui/material'
import { CustomButton, Positioned } from './styled'

const getSizes = (size: string) => {
	let sizes = {}
	switch (size) {
		case 'sm':
			sizes = { padding: '5px 20px', fontSize: '16px' }
			break
		case 'md':
			sizes = { padding: '10px 30px', fontSize: '18px' }
			break
		case 'lg':
			sizes = { padding: '16px 55px', fontSize: '20px' }
			break
		default:
			break
	}

	return sizes
}

const getColors = (type: string) => {
	let colors = {}
	switch (type) {
		case 'primary':
			colors = {
				color: 'white',
				backgroundColor: 'primary.main',
				borderColor: 'primary.main',
			}
			break
		case 'secondary':
			colors = {
				color: 'primary.main',
				backgroundColor: 'secondary.main',
				borderColor: 'secondary.main',
			}
			break

		case 'outlined':
			colors = {
				color: 'primary.main',
				backgroundColor: 'transparent',
				borderColor: 'primary.main',
			}
			break
		default:
			break
	}

	return colors
}

type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonPosition = 'center' | 'left' | 'right'
type ButtonType = 'primary' | 'secondary' | 'outlined'
type IconPositionType = 'left' | 'right'

interface ThemeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode | string
	size?: ButtonSize
	position?: ButtonPosition
	variant?: ButtonType
	full?: boolean
	solo?: boolean
	btnStyle?: SxProps
	MuiIcon?: OverridableComponent<SvgIconTypeMap<{ size: number }, 'svg'>>
	iconPosition?: IconPositionType
	loading?: boolean
	disabled?: boolean
	contSx?: SxProps
}

const ThemeButton = (props: ThemeButtonProps) => {
	const {
		children,
		size = 'md',
		position = 'center',
		variant = 'primary',
		full = false,
		solo = false,
		btnStyle = {},
		MuiIcon,
		iconPosition = 'left',
		loading = false,
		disabled = false,
		contSx = {},
	} = props

	const buttonProps = _.omit(props, [
		'children',
		'size',
		'position',
		'variant',
		'full',
		'solo',
		'btnStyle',
		'MuiIcon',
		'iconPosition',
		'disabled',
		'contSx',
		'loading',
	])

	return (
		<Positioned
			sx={{
				justifyContent: position,
				width: solo ? '100%' : 'fit-content',
				...contSx,
			}}
		>
			<CustomButton
				sx={{
					border: '1px solid',
					width: full ? '100%' : 'unset',
					flexDirection:
						iconPosition === 'right' ? 'row' : 'row-reverse',
					...getSizes(size.toLowerCase()),
					...getColors(variant.toLowerCase()),
					...btnStyle,
				}}
				{...buttonProps}
				disabled={disabled || loading}
				type='button'
			>
				{loading ? (
					<CircularProgress sx={{ color: 'white' }} size={18} />
				) : MuiIcon ? (
					<MuiIcon size={18} />
				) : null}
				{children}
			</CustomButton>
		</Positioned>
	)
}

export default ThemeButton

ThemeButton.defaultProps = {
	size: 'md',
	position: 'center',
	variant: 'primary',
	full: false,
	solo: false,
	btnStyle: {},
	MuiIcon: undefined,
	iconPosition: 'left',
	loading: false,
	disabled: false,
	contSx: {},
}
