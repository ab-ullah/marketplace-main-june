import { useState, useEffect } from 'react'
import { getColumns } from './responsive'

interface WindowDimentions {
	width: number
	height: number
	columns: number
}

function getWindowDimensions(): WindowDimentions {
	const { innerWidth: width, innerHeight: height } = window

	return {
		width,
		height,
		columns: getColumns(width),
	}
}

export default function useWindowDimensions(): WindowDimentions {
	const [windowDimensions, setWindowDimensions] = useState<WindowDimentions>(
		getWindowDimensions(),
	)

	useEffect(() => {
		function handleResize(): void {
			setWindowDimensions(getWindowDimensions())
		}

		window.addEventListener('resize', handleResize)

		return (): void => window.removeEventListener('resize', handleResize)
	}, [])

	return windowDimensions
}
