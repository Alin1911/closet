import React, { useEffect } from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClosetGridSkeleton from '../common/ClosetGridSkeleton';

export default function ClosetDetail({ closets, loading, error, onTrackViewed, onToggleFavorite, authUser, onNotify }) {
  const navigate = useNavigate();
  const { closetId } = useParams();
  const closet = closets.find((item) => item.id === closetId);

  useEffect(() => {
    if (closetId) {
      onTrackViewed(closetId);
    }
  }, [closetId, onTrackViewed]);

  if (loading) {
    return <Container className="py-4"><ClosetGridSkeleton count={2} /></Container>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  if (!closet) {
    return (
      <Container className="py-4">
        <p>Closet not found.</p>
        <Button variant="outline-info" onClick={() => navigate(-1)}>Go back</Button>
      </Container>
    );
  }

  const trailerId = closet.trailerLink ? closet.trailerLink.substring(closet.trailerLink.length - 11) : null;
  const relatedClosets = closets
    .filter((item) => item.id !== closet.id)
    .filter((item) => item.style && closet.style && item.style === closet.style)
    .slice(0, 3);
  const isSaved = authUser?.favoriteClosetIds?.includes(closet.id);

  return (
    <Container className="py-4">
      <div className="d-flex gap-2 mb-3">
        <Button variant="outline-info" onClick={() => navigate(-1)}>Back</Button>
        <Button as={Link} to="/browse" variant="outline-light">Browse</Button>
      </div>
      <Row className="g-3">
        <Col md={4}>
          <img src={closet.poster || closet.images?.[0]} alt={closet.name || 'Closet'} style={{ width: '100%', borderRadius: 8 }} />
        </Col>
        <Col md={8}>
          <h2>{closet.name || 'Closet'}</h2>
          <p>{closet.description || 'No description yet.'}</p>
          <div className="d-flex gap-2 flex-wrap mb-3">
            {closet.style ? <Badge bg="secondary">{closet.style}</Badge> : null}
            {closet.season ? <Badge bg="secondary">{closet.season}</Badge> : null}
            {closet.color ? <Badge bg="secondary">{closet.color}</Badge> : null}
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Button as={Link} to={`/coats/${closet.id}`} variant="info">View items</Button>
            {trailerId ? <Button as={Link} to={`/trailer/${trailerId}`} variant="outline-light">Watch lookbook</Button> : null}
            <Button variant={isSaved ? 'warning' : 'outline-warning'} onClick={async () => { try { const message = await onToggleFavorite(closet.id); onNotify?.(message); } catch (_) {} }} disabled={!authUser}>
              {isSaved ? 'Saved' : 'Save closet'}
            </Button>
          </div>
        </Col>
      </Row>

      <h4 className="mt-4">Related closets</h4>
      <Row className="g-3 mt-1">
        {relatedClosets.length ? relatedClosets.map((item) => (
          <Col md={4} key={item.id}>
            <Card bg="dark" text="light" className="h-100">
              <Card.Img variant="top" src={item.poster || item.images?.[0]} style={{ height: 180, objectFit: 'cover' }} />
              <Card.Body>
                <Card.Title>{item.name || 'Closet'}</Card.Title>
                <Button as={Link} to={`/closets/${item.id}`} variant="outline-info" onClick={() => onTrackViewed(item.id)}>Open</Button>
              </Card.Body>
            </Card>
          </Col>
        )) : <p className="text-secondary">No related closets available yet.</p>}
      </Row>
    </Container>
  );
}
