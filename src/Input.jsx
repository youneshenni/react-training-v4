import { useState } from "react"

export default function Input(props) {

    let [text, setText] = useState(props.defaultValue)
    return <div>
    <label>Text:</label><input type="text" value={text} onChange={e => {
        setText(e.target.value);
    }} /></div>
}