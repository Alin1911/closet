import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ClosetGridSkeleton from '../common/ClosetGridSkeleton';

export default function Saved({ closets, authUser, loading, onTrackViewed, onToggleFavorite, onNotify }) {
  const trailerIdFromLink = (link) => (link ? link.substring(link.length - 11) : null);

  if (!authUser) {
    return (
      <Container className="py-4">
        <h2>Saved closets</h2>
        <p>Please sign in from the Profile page to save closets.</p>
        <Button as={Link} to="/profile" variant="info">Go to Profile</Button>
      </Container>
    );
  }

  if (loading) {
    return <Container className="py-4"><ClosetGridSkeleton count={3} /></Container>;
  }

  return (
    <Container className="py-4">
      <h2>Saved closets</h2>
      {!closets.length ? (
        <div aria-live="polite">
          <p>You have not saved any closets yet.</p>
          <Button as={Link} to="/browse" variant="outline-info">Browse closets</Button>
        </div>
      ) : null}
      <Row className="g-3">
        {closets.map((item) => {
          const trailerId = trailerIdFromLink(item.trailerLink);
          return (
            <Col md={4} key={item.id}>
              <Card bg="dark" text="light" className="h-100">
                <Card.Img variant="top" src={item.poster || item.images?.[0]} style={{ height: 220, objectFit: 'cover' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{item.name || 'Closet'}</Card.Title>
                  <Card.Text>{item.description || 'No description yet.'}</Card.Text>
                  <div className="mt-auto d-grid gap-2">
                    <Button as={Link} to={`/closets/${item.id}`} variant="info" onClick={() => onTrackViewed(item.id)}>View details</Button>
                    <Button as={Link} to={`/coats/${item.id}`} variant="outline-info" onClick={() => onTrackViewed(item.id)}>View items</Button>
                    {trailerId ? <Button as={Link} to={`/trailer/${trailerId}`} variant="outline-light">Watch lookbook</Button> : null}
                    <Button
                      variant="warning"
                      onClick={async () => {
                        try {
                          const message = await onToggleFavorite(item.id);
                          onNotify?.(message);
                        } catch (error) {
                          onNotify?.(error?.message || 'Failed to remove closet from saved list. Please try again.');
                        }
                      }}
                    >
                      Remove from saved
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}
