import { useEffect, useRef, useState } from "react";
import api from "../../api/axiosConfig";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import CoatForm from  '../coatForm/CoatForm'
import './Coats.css'

import React from 'react'

export const Coats = ({getClosetData,closet, coats, setCoats, loading, error}) => {
    
    const coatText = useRef();
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    let params = useParams();
    const closetId = params.closetId; 

    useEffect(() => {
        getClosetData(closetId);
    }, [closetId, getClosetData]);

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

            await api.post("/api/v1/closets", {
              closetId,
              name: "Closet note",
              description: coatDescription,
              images: []
            });

            const updatedCoats = [...coats, {name: "Closet note", description: coatDescription}];
            coat.value = "";
            setCoats(updatedCoats);
          } catch (error) {
            console.error(error);
            setSubmitError('Could not save your note. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
      return <p className="text-center mt-5">Loading items...</p>;
    }

    if (error) {
      return <p className="text-center mt-5 text-danger">{error}</p>;
    }

  return (
    <Container className="coats-page">
      <Row className="mt-2">
        <Col>
          <h3>Items</h3>
          <img src={closet?.poster} alt="" />
        </Col>
        <Col>
          {
            <>
            <Row>
              <Col>
                <CoatForm handleSubmit={addCoat} coatText={coatText} labelText="Add item note" defaultValue="" isSubmitting={isSubmitting} />
                {submitError ? <p className="text-danger mt-2">{submitError}</p> : null}
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
                      {coat.description || coat.body}
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
