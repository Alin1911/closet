import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

export default function Profile({ authUser, onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const message = mode === 'login'
        ? await onLogin({ email, password })
        : await onRegister({ email, password, displayName });
      setSuccess(message);
      setPassword('');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not complete request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h2>Profile</h2>
      {authUser ? (
        <Card bg="dark" text="light" className="p-3 mb-3">
          <h5>{authUser.displayName}</h5>
          <p className="mb-1">{authUser.email}</p>
          <small>Saved closets: {authUser.favoriteClosetIds?.length || 0}</small>
        </Card>
      ) : (
        <p className="text-secondary">Sign in or register to save closets to your profile.</p>
      )}

      <Row>
        <Col md={6}>
          <Card bg="dark" text="light" className="p-3">
            <div className="d-flex gap-2 mb-3">
              <Button variant={mode === 'login' ? 'info' : 'outline-info'} onClick={() => setMode('login')}>Login</Button>
              <Button variant={mode === 'register' ? 'info' : 'outline-info'} onClick={() => setMode('register')}>Register</Button>
            </div>
            <Form onSubmit={submit}>
              {mode === 'register' ? (
                <Form.Group className="mb-3">
                  <Form.Label>Display name</Form.Label>
                  <Form.Control value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </Form.Group>
              ) : null}
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </Form.Group>
              {error ? <p className="text-danger">{error}</p> : null}
              {success ? <p className="text-success">{success}</p> : null}
              <Button type="submit" variant="info" disabled={submitting}>
                {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
