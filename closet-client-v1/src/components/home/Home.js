import React from 'react'
import Hero from '../hero/Hero'
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ClosetGridSkeleton from '../common/ClosetGridSkeleton';

export default function Home({closets, loading, error, recentlyViewedClosets, onTrackViewed, onToggleFavorite, authUser}) {
  if (loading) {
    return <Container className="py-4"><ClosetGridSkeleton /></Container>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  if (!closets.length) {
    return <p className="text-center mt-5">No closets found yet.</p>;
  }

  return (
    <Container fluid className="pb-4">
      <Hero closets={closets} onTrackViewed={onTrackViewed} />
      <Container className="mt-4">
        <h4>Continue browsing</h4>
        {!recentlyViewedClosets?.length ? <p className="text-secondary">Your recently viewed closets will appear here.</p> : null}
        <Row className="g-3">
          {recentlyViewedClosets?.map((item) => (
            <Col md={4} key={item.id}>
              <Card bg="dark" text="light">
                <Card.Img variant="top" src={item.poster || item.images?.[0]} style={{ height: 180, objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title>{item.name || 'Closet'}</Card.Title>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button as={Link} to={`/closets/${item.id}`} variant="outline-info" onClick={() => onTrackViewed(item.id)}>View details</Button>
                     <Button as={Link} to={`/coats/${item.id}`} variant="outline-light" onClick={() => onTrackViewed(item.id)}>View items</Button>
                     <Button variant={authUser?.favoriteClosetIds?.includes(item.id) ? 'warning' : 'outline-warning'} onClick={async () => { try { await onToggleFavorite(item.id); } catch (_) {} }} disabled={!authUser}>
                       {authUser?.favoriteClosetIds?.includes(item.id) ? 'Saved' : 'Save'}
                     </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  )
}
