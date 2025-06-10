export interface Country {
	label: string
	value: string
}

export interface Region {
	label: string
	value: string
	countries: string[]
}

export interface GeoSelector {
	label: string
	options: Country[] | Region[]
}
