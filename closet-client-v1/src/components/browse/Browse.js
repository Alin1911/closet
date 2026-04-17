import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Browse({ closets, loading, error, onTrackViewed, onToggleFavorite, authUser, onRefreshClosets }) {
  const [filters, setFilters] = useState({
    style: '',
    season: '',
    color: '',
    sort: 'newest'
  });
  const [favoriteError, setFavoriteError] = useState('');

  const options = useMemo(() => {
    const createOptions = (field) => [...new Set(closets.map((c) => c?.[field]).filter(Boolean))];
    return {
      styles: createOptions('style'),
      seasons: createOptions('season'),
      colors: createOptions('color')
    };
  }, [closets]);

  const filteredClosets = useMemo(() => {
    const apply = closets
      .filter((item) => (filters.style ? item.style === filters.style : true))
      .filter((item) => (filters.season ? item.season === filters.season : true))
      .filter((item) => (filters.color ? item.color === filters.color : true));

    if (filters.sort === 'name') {
      return [...apply].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return [...apply].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [closets, filters]);

  const trailerIdFromLink = (link) => (link ? link.substring(link.length - 11) : null);

  const handleFavorite = async (closetId) => {
    setFavoriteError('');
    try {
      await onToggleFavorite(closetId);
    } catch (err) {
      setFavoriteError(err?.message || 'Could not update saved closets.');
    }
  };

  const onFilterChange = async (name, value) => {
    const next = { ...filters, [name]: value };
    setFilters(next);
    await onRefreshClosets(next.sort === 'name' ? { sort: 'name' } : { sort: 'newest' });
  };

  if (loading) {
    return <p className="text-center mt-5">Loading closets...</p>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  return (
    <Container className="py-4">
      <h2>Browse closets</h2>
      <p className="text-secondary">Filter by style, season, and color, then sort by newest or name.</p>
      {favoriteError ? <p className="text-danger">{favoriteError}</p> : null}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Select value={filters.style} onChange={(e) => onFilterChange('style', e.target.value)}>
            <option value="">All styles</option>
            {options.styles.map((value) => <option key={value} value={value}>{value}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filters.season} onChange={(e) => onFilterChange('season', e.target.value)}>
            <option value="">All seasons</option>
            {options.seasons.map((value) => <option key={value} value={value}>{value}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filters.color} onChange={(e) => onFilterChange('color', e.target.value)}>
            <option value="">All colors</option>
            {options.colors.map((value) => <option key={value} value={value}>{value}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filters.sort} onChange={(e) => onFilterChange('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </Form.Select>
        </Col>
      </Row>

      {!filteredClosets.length ? <p>No closets found for the selected filters.</p> : null}

      <Row className="g-3">
        {filteredClosets.map((item) => {
          const trailerId = trailerIdFromLink(item.trailerLink);
          const isSaved = authUser?.favoriteClosetIds?.includes(item.id);
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
                    <Button variant={isSaved ? 'warning' : 'outline-warning'} onClick={() => handleFavorite(item.id)} disabled={!authUser}>
                      {isSaved ? 'Saved' : 'Save closet'}
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
