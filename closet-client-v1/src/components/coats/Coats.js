import { useEffect, useRef } from "react";
import api from "../../api/axiosConfig";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import CoatForm from  '../coatForm/CoatForm'

import React from 'react'

export const Coats = ({getClosetData,closet, coats, setCoats}) => {
    
    const coatText = useRef();
    let params = useParams();
    const closetId = params.closetId; 
    useEffect(() => {
        getClosetData(closetId);
    }, []);

    const addCoat = async (e) => {
        try {
            e.preventDefault();
            const coat = coatText.current;
            await api.post("/api/v1/closets",{body:coat.value,imdbId:closetId});
            const updatedCoats = [...coats,{body:coat.value}];
            coat.value = "";
            setCoats(updatedCoats);
          } catch (error) {
            console.error(error);
        }
    }

  return (
    <Container>
      <Row className="mt-2">
        <Col>
          <h3>Coats</h3>
          <img src={closet?.poster} alt="" />
        </Col>
        <Col>
          {
            <>
            <Row>
              <Col>
                <CoatForm handleSubmit={addCoat} coatText={coatText} labelText="Add a coat" defaultValue="" />
              </Col>
            </Row>
            <Row>
              <hr />
            </Row>
            </>
          }
          {
            coats.map((coat, index) => {
              return (
                <React.Fragment key={index}>
                  <Row>
                    <Col>
                      {coat.body}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <hr />
                    </Col>
                  </Row>
                </React.Fragment>
              )
            })
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
