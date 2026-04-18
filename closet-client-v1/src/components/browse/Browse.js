import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  size: 12
};

export default function Browse({ loading, error, onTrackViewed, onToggleFavorite, authUser, onNotify }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [favoriteError, setFavoriteError] = useState('');
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [facetCounts, setFacetCounts] = useState({ styles: {}, seasons: {}, colors: {} });
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const headingRef = useRef(null);

  const options = useMemo(() => {
    const toOptionList = (counts, fallbackField) => {
      const keys = Object.keys(counts || {});
      if (keys.length) {
        return keys;
      }
      return [...new Set(items.map((c) => c?.[fallbackField]).filter(Boolean))];
    };
    return {
      styles: toOptionList(facetCounts.styles, 'style'),
      seasons: toOptionList(facetCounts.seasons, 'season'),
      colors: toOptionList(facetCounts.colors, 'color')
    };
  }, [items, facetCounts]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    setPageInput(String((filters.page || 0) + 1));
  }, [filters.page]);

  useEffect(() => {
    const parseHeaderObject = (headerValue) => {
      if (!headerValue) {
        return {};
      }
      try {
        return JSON.parse(headerValue);
      } catch (_) {
        return {};
      }
    };

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
        setFacetCounts({
          styles: parseHeaderObject(response.headers['x-facet-styles']),
          seasons: parseHeaderObject(response.headers['x-facet-seasons']),
          colors: parseHeaderObject(response.headers['x-facet-colors'])
        });
      } catch (err) {
        console.error(err);
        setBrowseError('Could not load closets for browse.');
      } finally {
        setBrowseLoading(false);
      }
    };
    fetchBrowseClosets();
  }, [filters, refreshKey]);

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
    if (name === 'page') {
      const pageNumber = Number(value);
      if (Number.isNaN(pageNumber) || pageNumber < 0) {
        return;
      }
    }
    const next = { ...filters, [name]: value, page: name === 'page' ? value : 0 };
    setFilters(next);
    if (name === 'q') {
      trackEvent('closet_search', { queryLength: (value || '').trim().length });
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
    return (
      <Container className="py-4">
        <p className="text-center mt-5 text-danger">{error || browseError}</p>
        <div className="text-center">
          <Button variant="outline-info" onClick={() => setRefreshKey((value) => value + 1)}>Retry</Button>
        </div>
      </Container>
    );
  }

  const pageItems = [];
  if (totalPages > 1) {
    const start = Math.max(0, filters.page - 2);
    const end = Math.min(totalPages - 1, filters.page + 2);
    for (let index = start; index <= end; index += 1) {
      pageItems.push(index);
    }
  }

  return (
    <Container className="py-4">
      <h2 tabIndex={-1} ref={headingRef}>Browse closets</h2>
      <p className="text-secondary">Search, filter by style/season/color, and sort by newest or name.</p>
      {favoriteError ? <p className="text-danger">{favoriteError}</p> : null}
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Control
            aria-label="Search closets"
            placeholder="Search closets..."
            value={filters.q}
            onChange={(e) => onFilterChange('q', e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select aria-label="Filter by style" value={filters.style} onChange={(e) => onFilterChange('style', e.target.value)}>
            <option value="">All styles</option>
            {options.styles.map((value) => <option key={value} value={value}>{value} ({facetCounts.styles?.[value] || 0})</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select aria-label="Filter by season" value={filters.season} onChange={(e) => onFilterChange('season', e.target.value)}>
            <option value="">All seasons</option>
            {options.seasons.map((value) => <option key={value} value={value}>{value} ({facetCounts.seasons?.[value] || 0})</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select aria-label="Filter by color" value={filters.color} onChange={(e) => onFilterChange('color', e.target.value)}>
            <option value="">All colors</option>
            {options.colors.map((value) => <option key={value} value={value}>{value} ({facetCounts.colors?.[value] || 0})</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select aria-label="Sort closets" value={filters.sort} onChange={(e) => onFilterChange('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </Form.Select>
        </Col>
        <Col md={1}>
          <Button variant="outline-light" className="w-100" onClick={resetFilters}>Reset</Button>
        </Col>
      </Row>

      {!items.length ? (
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <p className="mb-0">No closets found for the selected filters.</p>
          <Button variant="outline-light" onClick={resetFilters}>Clear filters</Button>
        </div>
      ) : null}
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
        <Pagination className="mt-4 align-items-center flex-wrap">
          <Pagination.Prev disabled={filters.page === 0} onClick={() => onFilterChange('page', filters.page - 1)} />
          {pageItems.map((pageNumber) => (
            <Pagination.Item
              key={pageNumber}
              active={pageNumber === filters.page}
              onClick={() => onFilterChange('page', pageNumber)}
            >
              {pageNumber + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next disabled={filters.page + 1 >= totalPages} onClick={() => onFilterChange('page', filters.page + 1)} />
          <Form className="d-flex align-items-center gap-2 ms-2" onSubmit={(e) => {
            e.preventDefault();
            const targetPage = Number(pageInput) - 1;
            if (!Number.isNaN(targetPage) && targetPage >= 0 && targetPage < totalPages) {
              onFilterChange('page', targetPage);
            }
          }}>
            <small className="text-secondary">Jump to</small>
            <Form.Control
              size="sm"
              style={{ width: 70 }}
              value={pageInput}
              inputMode="numeric"
              aria-label="Jump to page"
              onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ''))}
            />
            <Button size="sm" type="submit" variant="outline-info">Go</Button>
          </Form>
        </Pagination>
      ) : null}
    </Container>
  );
}
