import { ChangeEvent } from 'react'
import { SelectChangeEvent } from '@mui/material/Select'

export type TextChangeEventType =
	| SelectChangeEvent
	| ChangeEvent<HTMLInputElement>
