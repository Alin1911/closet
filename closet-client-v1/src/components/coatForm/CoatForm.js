import { Button, Form, Input, Rate } from 'react-bootstrap'
import React from 'react'

export default function CoatForm({ handleSubmit,coatText,labelText,defaultValue }) {
  return (
    <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>{labelText}</Form.Label>
            <Form.Control ref={coatText} as="textarea" rows={3} defaultValue={defaultValue}/>
        </Form.Group>
        <Button variant="outline-info" onClick={handleSubmit}>Submit</Button>
    </Form>
  )
}
