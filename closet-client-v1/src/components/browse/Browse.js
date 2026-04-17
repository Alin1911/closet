import React, { useMemo, useState, useEffect } from 'react';
import { Button, Card, Col, Container, Form, Pagination, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import ClosetGridSkeleton from '../common/ClosetGridSkeleton';
import { trackEvent } from '../../utils/analytics';

const DEFAULT_FILTERS = {
  style: '',
  season: '',
  color: '',
  sort: 'newest',
  q: '',
  page: 0,
  size: 9
};

export default function Browse({ loading, error, onTrackViewed, onToggleFavorite, authUser, onNotify }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [favoriteError, setFavoriteError] = useState('');
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const options = useMemo(() => {
    const createOptions = (field) => [...new Set(items.map((c) => c?.[field]).filter(Boolean))];
    return {
      styles: createOptions('style'),
      seasons: createOptions('season'),
      colors: createOptions('color')
    };
  }, [items]);

  useEffect(() => {
    const fetchBrowseClosets = async () => {
      setBrowseLoading(true);
      setBrowseError('');
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        const response = await api.get(`/api/v1/closets?${params.toString()}`);
        setItems(response.data || []);
        setTotalPages(Number(response.headers['x-total-pages'] || 0));
        setTotalCount(Number(response.headers['x-total-count'] || (response.data || []).length));
      } catch (err) {
        console.error(err);
        setBrowseError('Could not load closets for browse.');
      } finally {
        setBrowseLoading(false);
      }
    };
    fetchBrowseClosets();
  }, [filters]);

  const trailerIdFromLink = (link) => (link ? link.substring(link.length - 11) : null);

  const handleFavorite = async (closetId) => {
    setFavoriteError('');
    try {
      const message = await onToggleFavorite(closetId);
      onNotify?.(message);
    } catch (err) {
      setFavoriteError(err?.message || 'Could not update saved closets.');
    }
  };

  const onFilterChange = (name, value) => {
    const next = { ...filters, [name]: value, page: name === 'page' ? value : 0 };
    setFilters(next);
    if (name === 'q') {
      trackEvent('closet_search', { query: value });
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    trackEvent('browse_filters_reset');
  };

  if (loading || browseLoading) {
    return <Container className="py-4"><ClosetGridSkeleton /></Container>;
  }

  if (error || browseError) {
    return <p className="text-center mt-5 text-danger">{error || browseError}</p>;
  }

  return (
    <Container className="py-4">
      <h2>Browse closets</h2>
      <p className="text-secondary">Search, filter by style/season/color, and sort by newest or name.</p>
      {favoriteError ? <p className="text-danger">{favoriteError}</p> : null}
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Control placeholder="Search closets..." value={filters.q} onChange={(e) => onFilterChange('q', e.target.value)} />
        </Col>
        <Col md={2}>
          <Form.Select value={filters.style} onChange={(e) => onFilterChange('style', e.target.value)}>
            <option value="">All styles</option>
            {options.styles.map((value) => <option key={value} value={value}>{value}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={filters.season} onChange={(e) => onFilterChange('season', e.target.value)}>
            <option value="">All seasons</option>
            {options.seasons.map((value) => <option key={value} value={value}>{value}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={filters.color} onChange={(e) => onFilterChange('color', e.target.value)}>
            <option value="">All colors</option>
            {options.colors.map((value) => <option key={value} value={value}>{value}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={filters.sort} onChange={(e) => onFilterChange('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </Form.Select>
        </Col>
        <Col md={1}>
          <Button variant="outline-light" className="w-100" onClick={resetFilters}>Reset</Button>
        </Col>
      </Row>

      {!items.length ? <p>No closets found for the selected filters.</p> : null}
      {items.length ? <p className="text-secondary">Showing {items.length} of {totalCount} closets</p> : null}

      <Row className="g-3">
        {items.map((item) => {
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
      {totalPages > 1 ? (
        <Pagination className="mt-4">
          <Pagination.Prev disabled={filters.page <= 0} onClick={() => onFilterChange('page', filters.page - 1)} />
          <Pagination.Item active>{filters.page + 1}</Pagination.Item>
          <Pagination.Next disabled={filters.page + 1 >= totalPages} onClick={() => onFilterChange('page', filters.page + 1)} />
        </Pagination>
      ) : null}
    </Container>
  );
}
