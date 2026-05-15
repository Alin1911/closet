import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import api from '../../api/axiosConfig';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export default function Planner({
  closets,
  plans,
  loading,
  error,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
  onNotify
}) {
  const [editingId, setEditingId] = useState(null);
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedClosetIds, setSelectedClosetIds] = useState([]);
  const [selectedCoatIds, setSelectedCoatIds] = useState([]);
  const [availableCoats, setAvailableCoats] = useState([]);
  const [coatsLoading, setCoatsLoading] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));

  const plansByDate = useMemo(() => {
    const grouped = new Map();
    plans.forEach((plan) => {
      const bucket = grouped.get(plan.planDate) || [];
      bucket.push(plan);
      grouped.set(plan.planDate, bucket);
    });
    return grouped;
  }, [plans]);

  const upcomingPlans = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...plans]
      .filter((plan) => plan.planDate >= today)
      .sort((left, right) => left.planDate.localeCompare(right.planDate))
      .slice(0, 6);
  }, [plans]);

  const monthCells = useMemo(() => {
    const first = startOfMonth(monthCursor);
    const firstWeekday = first.getDay();
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayString = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push(dayString);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [monthCursor]);

  useEffect(() => {
    if (!selectedClosetIds.length) {
      setAvailableCoats([]);
      setSelectedCoatIds([]);
      return;
    }
    let active = true;
    const fetchCoats = async () => {
      setCoatsLoading(true);
      try {
        const responses = await Promise.all(
          selectedClosetIds.map(async (closetId) => {
            const response = await api.get(`/api/v1/closets/${closetId}/coats`);
            return (response.data || []).map((coat) => ({ ...coat, closetId }));
          })
        );
        if (!active) {
          return;
        }
        const flattened = responses.flat();
        setAvailableCoats(flattened);
        setSelectedCoatIds((previous) => previous.filter((id) => flattened.some((coat) => coat.id === id)));
      } catch (_) {
        if (active) {
          setAvailableCoats([]);
          setSelectedCoatIds([]);
          onNotify?.('Could not load clothing items for selected closets.');
        }
      } finally {
        if (active) {
          setCoatsLoading(false);
        }
      }
    };
    fetchCoats();
    return () => {
      active = false;
    };
  }, [selectedClosetIds, onNotify]);

  const resetForm = () => {
    setEditingId(null);
    setPlanDate(new Date().toISOString().slice(0, 10));
    setTitle('');
    setNotes('');
    setSelectedClosetIds([]);
    setSelectedCoatIds([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        planDate,
        title,
        notes,
        closetIds: selectedClosetIds,
        coatIds: selectedCoatIds
      };
      const message = editingId
        ? await onUpdate(editingId, payload)
        : await onCreate(payload);
      onNotify?.(message);
      resetForm();
    } catch (submitError) {
      onNotify?.(submitError?.response?.data?.message || submitError?.message || 'Could not save outfit plan.');
    }
  };

  const beginEdit = (plan) => {
    setEditingId(plan.id);
    setPlanDate(plan.planDate);
    setTitle(plan.title || '');
    setNotes(plan.notes || '');
    setSelectedClosetIds(plan.closetIds || []);
    setSelectedCoatIds(plan.coatIds || []);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-3">Outfit planner</h2>
      <p className="text-secondary">Plan looks by date, map them to closets and items, and track what is coming up next.</p>

      <Card bg="dark" text="light" className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">{monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h4>
            <div className="d-flex gap-2">
              <Button variant="outline-info" size="sm" onClick={() => setMonthCursor((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1))}>Previous</Button>
              <Button variant="outline-info" size="sm" onClick={() => setMonthCursor((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1))}>Next</Button>
            </div>
          </div>
          <Row className="g-2 text-center fw-semibold mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => <Col key={label}>{label}</Col>)}
          </Row>
          <Row className="g-2">
            {monthCells.map((cell, index) => (
              <Col className="planner-day-col" key={`${cell || 'blank'}-${index}`}>
                <div className="border rounded p-2 h-100 text-center">
                  {cell ? (
                    <>
                      <div>{Number(cell.slice(-2))}</div>
                      {(plansByDate.get(cell)?.length || 0) > 0 ? <Badge bg="info">{plansByDate.get(cell).length} plans</Badge> : null}
                    </>
                  ) : <span className="text-secondary">—</span>}
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <Card bg="dark" text="light" className="mb-4">
        <Card.Body>
          <h4>Upcoming</h4>
          {!upcomingPlans.length ? <p className="text-secondary mb-0">No upcoming outfits yet.</p> : (
            <ul className="mb-0 ps-3">
              {upcomingPlans.map((plan) => (
                <li key={`upcoming-${plan.id}`} className="mb-1">
                  <strong>{formatDateLabel(plan.planDate)}</strong> — {plan.title}
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>

      <Card bg="dark" text="light" className="mb-4">
        <Card.Body>
          <h4>{editingId ? 'Edit outfit plan' : 'Create outfit plan'}</h4>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="planner-date">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" value={planDate} onChange={(event) => setPlanDate(event.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group controlId="planner-title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Smart casual office look" required />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="planner-notes">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control as="textarea" rows={2} value={notes} maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes..." />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Label>Closets</Form.Label>
                <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {!closets.length ? <p className="text-secondary mb-0">No closets available.</p> : closets.map((closet) => (
                    <Form.Check
                      key={`closet-${closet.id}`}
                      id={`closet-${closet.id}`}
                      type="checkbox"
                      label={closet.name || 'Closet'}
                      checked={selectedClosetIds.includes(closet.id)}
                      onChange={(event) => {
                        setSelectedClosetIds((previous) => event.target.checked
                          ? [...previous, closet.id]
                          : previous.filter((id) => id !== closet.id));
                      }}
                    />
                  ))}
                </div>
              </Col>
              <Col md={6}>
                <Form.Label>Clothing items</Form.Label>
                <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {coatsLoading ? <Spinner animation="border" size="sm" /> : null}
                  {!coatsLoading && !availableCoats.length ? <p className="text-secondary mb-0">Select a closet to load its items.</p> : null}
                  {availableCoats.map((coat) => (
                    <Form.Check
                      key={`coat-${coat.id}`}
                      id={`coat-${coat.id}`}
                      type="checkbox"
                      label={coat.name || 'Item note'}
                      checked={selectedCoatIds.includes(coat.id)}
                      onChange={(event) => {
                        setSelectedCoatIds((previous) => event.target.checked
                          ? [...previous, coat.id]
                          : previous.filter((id) => id !== coat.id));
                      }}
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="info">{editingId ? 'Update plan' : 'Save plan'}</Button>
              {editingId ? <Button type="button" variant="outline-light" onClick={resetForm}>Cancel edit</Button> : null}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <h4 className="mb-3">Planned outfits</h4>
      {loading ? <Spinner animation="border" /> : null}
      {error ? <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button variant="outline-danger" size="sm" onClick={onRetry}>Retry</Button></Alert> : null}
      {!loading && !error && !plans.length ? <p className="text-secondary">No outfit plans yet. Create your first one above.</p> : null}
      {!loading && !error && plans.length ? (
        <div className="d-flex flex-column gap-3">
          {plans.map((plan) => (
            <Card key={plan.id} bg="dark" text="light">
              <Card.Body>
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1">{plan.title}</h5>
                    <p className="mb-2 text-secondary">{formatDateLabel(plan.planDate)}</p>
                    {plan.notes ? <p className="mb-2">{plan.notes}</p> : null}
                    <div className="d-flex gap-2 flex-wrap">
                      <Badge bg="secondary">{(plan.closetIds || []).length} closets</Badge>
                      <Badge bg="secondary">{(plan.coatIds || []).length} items</Badge>
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-start">
                    <Button variant="outline-info" size="sm" onClick={() => beginEdit(plan)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={async () => {
                      try {
                        const message = await onDelete(plan.id);
                        onNotify?.(message);
                        if (editingId === plan.id) {
                          resetForm();
                        }
                      } catch (deleteError) {
                        onNotify?.(deleteError?.response?.data?.message || deleteError?.message || 'Could not delete outfit plan.');
                      }
                    }}>Delete</Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : null}
    </Container>
  );
}
