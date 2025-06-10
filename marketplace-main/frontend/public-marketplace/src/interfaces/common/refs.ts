/* eslint-disable import/prefer-default-export */
import { RefObject } from 'react'

type ScrollRefType =
	| ((instance: HTMLHeadingElement | null) => void)
	| RefObject<HTMLHeadingElement>
	| null
	| undefined

export type { ScrollRefType }
