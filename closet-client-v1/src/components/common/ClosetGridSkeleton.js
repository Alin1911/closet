import React from 'react';
import { Card, Col, Placeholder, Row } from 'react-bootstrap';

export default function ClosetGridSkeleton({ count = 6 }) {
  return (
    <Row className="g-3">
      {Array.from({ length: count }).map((_, index) => (
        <Col md={4} key={`skeleton-${index}`}>
          <Card bg="dark" text="light" className="h-100">
            <Placeholder as={Card.Img} animation="glow" style={{ height: 220 }} />
            <Card.Body>
              <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={8} />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={12} /> <Placeholder xs={10} />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
