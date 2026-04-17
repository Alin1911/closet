import { Button, Form } from 'react-bootstrap'
import React from 'react'

export default function CoatForm({ handleSubmit,coatText,labelText,defaultValue, isSubmitting }) {
  return (
    <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>{labelText}</Form.Label>
            <Form.Control ref={coatText} as="textarea" rows={3} defaultValue={defaultValue}/>
        </Form.Group>
        <Button type="submit" variant="outline-info" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
    </Form>
  )
}
