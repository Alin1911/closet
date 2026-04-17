import { useEffect, useRef, useState } from "react";
import api from "../../api/axiosConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import CoatForm from  '../coatForm/CoatForm'
import './Coats.css'

import React from 'react'

export const Coats = ({getClosetData,closet, coats, setCoats, loading, error, onTrackViewed}) => {
    
    const coatText = useRef();
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCoatId, setEditingCoatId] = useState('');
    const [editingText, setEditingText] = useState('');
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
              images: []
            });

            const created = response?.data?.data || {name: "Closet note", description: coatDescription};
            const updatedCoats = [...coats, created];
            coat.value = "";
            setCoats(updatedCoats);
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
    };

    const cancelEdit = () => {
      setEditingCoatId('');
      setEditingText('');
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
          images: coat.images || []
        });
        const updated = response?.data?.data;
        setCoats(coats.map((item) => item.id === coat.id ? updated : item));
        cancelEdit();
      } catch (err) {
        console.error(err);
        setEditError('Could not update this note.');
      }
    };

    const deleteCoat = async (coatId) => {
      try {
        await api.delete(`/api/v1/closets/${closetId}/coats/${coatId}`);
        setCoats(coats.filter((item) => item.id !== coatId));
      } catch (err) {
        console.error(err);
        setEditError('Could not delete this note.');
      }
    };

    if (loading) {
      return <p className="text-center mt-5">Loading items...</p>;
    }

    if (error) {
      return <p className="text-center mt-5 text-danger">{error}</p>;
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
                <CoatForm handleSubmit={addCoat} coatText={coatText} labelText="Add item note" defaultValue="" isSubmitting={isSubmitting} />
                {submitError ? <p className="text-danger mt-2">{submitError}</p> : null}
                {editError ? <p className="text-danger mt-2">{editError}</p> : null}
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
                          <div className="d-flex gap-2 mt-2">
                            <Button variant="info" onClick={() => saveEdit(coat)}>Save</Button>
                            <Button variant="outline-light" onClick={cancelEdit}>Cancel</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>{coat.description || coat.body}</p>
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
            }) : <p className="mt-3">No item notes yet.</p>
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
