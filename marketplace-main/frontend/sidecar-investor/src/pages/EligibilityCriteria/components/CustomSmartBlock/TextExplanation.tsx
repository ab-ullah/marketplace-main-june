import { useEffect, useState } from "react"
import { Form } from "react-bootstrap"

const TextExplanation = ({ initialValue, label, submitValue }: any) => {
    const [value, setValue] = useState("");

    useEffect(() => {
        setValue(initialValue)
    }, [])

    return <div className='mb-2' style={{paddingLeft: '40px'}}>
    <Form.Label>{label}</Form.Label>
    <Form.Control
     onChange={(e) => setValue(e.target.value)}
     onBlur={() => submitValue(value)}
     value={value}
     placeholder={label} />
    </div>
}

export default TextExplanation