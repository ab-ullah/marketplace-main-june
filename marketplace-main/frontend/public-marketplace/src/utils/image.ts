export const getRandomColor = () => {
	const letters = '0123456789ABCDEF'
	let color = '#'
	for (let i = 0; i < 6; i += 1) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}

const getInitials = (name: string) => {
	let initials = ''
	const nameSplit = name.split(' ')
	const nameLength = nameSplit.length
	if (nameLength > 1) {
		initials =
			nameSplit[0].substring(0, 1) +
			nameSplit[nameLength - 1].substring(0, 1)
	} else if (nameLength === 1) {
		initials = nameSplit[0].substring(0, 1)
	}

	return initials.toUpperCase()
}

export const createImageFromInitials = (
	size: number,
	_name: string,
	color: string | CanvasGradient | CanvasPattern,
) => {
	const name = getInitials(_name)

	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')
	if (context) {
		canvas.width = size
		canvas.height = size

		context.fillStyle = '#ffffff'
		context.fillRect(0, 0, size, size)

		context.fillStyle = `${color}50`
		context.fillRect(0, 0, size, size)

		context.fillStyle = color
		context.textBaseline = 'middle'
		context.textAlign = 'center'
		context.font = `${size / 3}px Quicksand`
		context.fillText(name, size / 2, size / 2)
	}

	return canvas.toDataURL()
}
