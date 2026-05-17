import { useEffect, useRef, useState } from "react";
import api from "../../api/axiosConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import CoatForm from  '../coatForm/CoatForm'
import './Coats.css'
import ClosetGridSkeleton from "../common/ClosetGridSkeleton";

import React from 'react'

export const Coats = ({getClosetData,closet, coats, setCoats, loading, error, onTrackViewed, onNotify}) => {
    
    const coatText = useRef();
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCoatId, setEditingCoatId] = useState('');
    const [editingText, setEditingText] = useState('');
    const [draftImages, setDraftImages] = useState([]);
    const [draftTags, setDraftTags] = useState([]);
    const [uploadInProgress, setUploadInProgress] = useState(false);
    const [editingTags, setEditingTags] = useState([]);
    const [editError, setEditError] = useState('');
    const navigate = useNavigate();
    let params = useParams();
    const closetId = params.closetId; 

    useEffect(() => {
        getClosetData(closetId);
        onTrackViewed?.(closetId);
    }, [closetId, getClosetData, onTrackViewed]);

    const addCoat = async (e) => {
        try {
            e.preventDefault();
            const coat = coatText.current;
            const coatDescription = coat.value?.trim();
            if (!coatDescription) {
              setSubmitError('Please enter a note before submitting.');
              return;
            }
            setSubmitError('');
            setIsSubmitting(true);

            const response = await api.post(`/api/v1/closets/${closetId}/coats`, {
              name: "Closet note",
              description: coatDescription,
              images: draftImages,
              tags: draftTags
            });

            const created = response?.data?.data || {name: "Closet note", description: coatDescription};
            const updatedCoats = [...coats, created];
            coat.value = "";
            setDraftImages([]);
            setDraftTags([]);
            setCoats(updatedCoats);
            onNotify?.(response?.data?.message || 'Item note created.');
          } catch (error) {
            console.error(error);
            setSubmitError('Could not save your note. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const startEdit = (coat) => {
      setEditError('');
      setEditingCoatId(coat.id);
      setEditingText(coat.description || coat.body || '');
      setEditingTags(coat.tags || []);
    };

    const cancelEdit = () => {
      setEditingCoatId('');
      setEditingText('');
      setEditingTags([]);
      setEditError('');
    };

    const saveEdit = async (coat) => {
      try {
        if (!editingText.trim()) {
          setEditError('Please enter a note before saving.');
          return;
        }
        const response = await api.put(`/api/v1/closets/${closetId}/coats/${coat.id}`, {
          name: coat.name || 'Closet note',
          description: editingText.trim(),
          images: coat.images || [],
          tags: editingTags
        });
        const updated = response?.data?.data;
        setCoats(coats.map((item) => item.id === coat.id ? updated : item));
        cancelEdit();
        onNotify?.(response?.data?.message || 'Item note updated.');
      } catch (err) {
        console.error(err);
        setEditError('Could not update this note.');
      }
    };

    const parseTags = (value) => value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .filter((item, index, values) => values.indexOf(item) === index);

    const onDraftTagsChange = (value) => {
      setDraftTags(parseTags(value));
    };

    const onEditingTagsChange = (value) => {
      setEditingTags(parseTags(value));
    };

    const uploadImage = async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image exceeds the 5MB limit.');
        event.target.value = '';
        return;
      }
      setSubmitError('');
      setUploadInProgress(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/v1/uploads/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const payload = response?.data?.data;
        if (payload?.url) {
          setDraftImages((previous) => [...previous, payload.url]);
        }
        if (payload?.suggestedTags?.length) {
          setDraftTags((previous) => [...new Set([...previous, ...payload.suggestedTags])]);
        }
      } catch (uploadError) {
        console.error(uploadError);
        setSubmitError(uploadError?.response?.data?.message || 'Could not upload image.');
      } finally {
        setUploadInProgress(false);
        event.target.value = '';
      }
    };

    const deleteCoat = async (coatId) => {
      try {
        const response = await api.delete(`/api/v1/closets/${closetId}/coats/${coatId}`);
        setCoats(coats.filter((item) => item.id !== coatId));
        onNotify?.(response?.data?.message || 'Item note deleted.');
      } catch (err) {
        console.error(err);
        setEditError('Could not delete this note.');
      }
    };

    if (loading) {
      return <Container className="py-4"><ClosetGridSkeleton count={2} /></Container>;
    }

    if (error) {
      return (
        <Container className="py-4 text-center">
          <p className="mt-5 text-danger" aria-live="assertive">{error}</p>
          <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
            <Button variant="outline-info" onClick={() => getClosetData(closetId)}>Retry</Button>
            <Button as={Link} to="/browse" variant="outline-light">Browse closets</Button>
          </div>
        </Container>
      );
    }

  return (
    <Container className="coats-page">
      <div className="d-flex gap-2 mt-3 mb-2">
        <Button variant="outline-info" onClick={() => navigate(-1)}>Back</Button>
        <Button as={Link} to={`/closets/${closetId}`} variant="outline-light">Closet details</Button>
      </div>
      <Row className="mt-2">
        <Col>
          <h3>Items</h3>
          <img src={closet?.poster} alt={closet?.name || 'Closet'} />
        </Col>
        <Col>
          {
            <>
            <Row>
              <Col>
                <CoatForm
                  handleSubmit={addCoat}
                  coatText={coatText}
                  labelText="Add item note"
                  defaultValue=""
                  isSubmitting={isSubmitting}
                  onUploadImage={uploadImage}
                  uploadInProgress={uploadInProgress}
                  images={draftImages}
                  tags={draftTags}
                  onTagChange={onDraftTagsChange}
                />
                {submitError ? <p className="text-danger mt-2" aria-live="assertive">{submitError}</p> : null}
                {editError ? <p className="text-danger mt-2" aria-live="assertive">{editError}</p> : null}
              </Col>
            </Row>
            <Row>
              <hr />
            </Row>
            </>
          }
          {
            coats.length ? coats.map((coat, index) => {
              return (
                <React.Fragment key={index}>
                  <Row>
                    <Col>
                      {editingCoatId === coat.id ? (
                        <>
                           <Form.Control as="textarea" rows={3} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                           <Form.Control className="mt-2" value={editingTags.join(', ')} placeholder="tag1, tag2" onChange={(e) => onEditingTagsChange(e.target.value)} />
                           <div className="d-flex gap-2 mt-2">
                             <Button variant="info" onClick={() => saveEdit(coat)}>Save</Button>
                             <Button variant="outline-light" onClick={cancelEdit}>Cancel</Button>
                           </div>
                         </>
                       ) : (
                         <>
                           <p>{coat.description || coat.body}</p>
                           {coat.tags?.length ? <p className="text-secondary small mb-2">Tags: {coat.tags.join(', ')}</p> : null}
                           {coat.images?.length ? (
                             <div className="d-flex flex-wrap gap-2 mb-2">
                               {coat.images.map((image) => (
                                 <img key={image} src={image} alt={coat.name || 'Item note'} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} />
                               ))}
                             </div>
                           ) : null}
                           <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-info" onClick={() => startEdit(coat)}>Edit</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => deleteCoat(coat.id)}>Delete</Button>
                          </div>
                        </>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <hr />
                    </Col>
                  </Row>
                </React.Fragment>
              )
            }) : <p className="mt-3">No item notes yet. Add your first note above.</p>
          }
        </Col>
      </Row>
      <Row>
            <Col>
                <hr />
            </Col>
        </Row>       
    </Container>
  )
}
