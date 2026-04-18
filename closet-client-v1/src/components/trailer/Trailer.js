import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import './Trailer.css'
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import React from 'react'

export const Trailer = () => {
    let params = useParams();
    let key = params.ytTrailerId;
    const navigate = useNavigate();
  return (
    <Container className="py-3">
      <Button variant="outline-info" className="mb-2" onClick={() => navigate(-1)}>Back</Button>
      <div className="react-player-container">
        {(key != null) ? <ReactPlayer controls playing={true} 
        url={`https://www.youtube.com/watch?v=${key}`}
        title="Closet lookbook video player"
        width= '100%' height= '100%' /> : null}
      </div>
    </Container>
  )
}
