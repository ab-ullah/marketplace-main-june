/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentUploadContainer } from './styled'

interface DocumentDropZoneProps {
	onFileSelect: (fileData: any) => void
}

const DocumentDropZone: FunctionComponent<DocumentDropZoneProps> = ({
	onFileSelect,
}) => {
	const onDrop = useCallback((acceptedFiles: any[]) => {
		acceptedFiles.map((acceptedFile: any) => onFileSelect(acceptedFile))
	}, [])

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = useDropzone({ onDrop })

	return (
		<div className='container'>
			<DocumentUploadContainer
				{...getRootProps({ isDragActive, isDragAccept, isDragReject })}
			>
				<input {...getInputProps()} />
				<p>Drag and drop files here, or select on your device</p>
				<button className='select-button'>select</button>
			</DocumentUploadContainer>
		</div>
	)
}

export default DocumentDropZone
