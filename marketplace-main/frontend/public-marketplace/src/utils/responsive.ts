const getColumns = (_width: number) => {
	let cols = 1
	if (_width >= 1370) cols = 3
	else if (_width >= 1300) cols = 3
	else if (_width >= 900) cols = 2
	return cols
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const splitArray = (array: any[], cols: number) => {
	const newArr = []
	const div = Math.floor(array.length / cols)

	for (let i = 0; i < cols; i += 1) {
		newArr.push(array.splice(0, div))
	}
	if (array.length > 0) {
		for (let i = 0; i < array.length; i += 1) {
			newArr[i].push(array[i])
		}
	}
	return newArr
}

export { getColumns, splitArray }
