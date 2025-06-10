export interface ToolTipText {
	description: string
	heading: string
}

export const isToolTipText = (
	text: string | ToolTipText | undefined,
): text is ToolTipText =>
	typeof text !== 'string' &&
	text !== undefined &&
	typeof (text as ToolTipText).description === 'string' &&
	typeof (text as ToolTipText).heading === 'string'
