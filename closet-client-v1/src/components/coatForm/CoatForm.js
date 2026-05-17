import { Button, Form } from 'react-bootstrap'
import React from 'react'

export default function CoatForm({
  handleSubmit,
  coatText,
  labelText,
  defaultValue,
  isSubmitting,
  onUploadImage,
  uploadInProgress,
  images = [],
  tags = [],
  onTagChange
}) {
  return (
    <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>{labelText}</Form.Label>
            <Form.Control ref={coatText} as="textarea" rows={3} defaultValue={defaultValue}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="coatImageUpload">
            <Form.Label>Attach image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={onUploadImage} disabled={uploadInProgress || isSubmitting} />
            <Form.Text className="text-muted">PNG, JPG, WEBP, GIF up to 5MB.</Form.Text>
        </Form.Group>
        {images.length ? (
          <div className="mb-3 d-flex flex-wrap gap-2">
            {images.map((image) => (
              <img key={image} src={image} alt="Item note" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} />
            ))}
          </div>
        ) : null}
        <Form.Group className="mb-3" controlId="coatTagsInput">
            <Form.Label>Tags</Form.Label>
            <Form.Control value={tags.join(', ')} placeholder="winter, casual, blue" onChange={(event) => onTagChange?.(event.target.value)} />
            <Form.Text className="text-muted">Auto-suggested tags are editable.</Form.Text>
        </Form.Group>
        <Button type="submit" variant="outline-info" disabled={isSubmitting || uploadInProgress}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
    </Form>
  )
}
