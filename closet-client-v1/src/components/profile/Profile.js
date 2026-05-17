import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

export default function Profile({
  authUser,
  onLogin,
  onRegister,
  onUpdateProfile,
  onNotify,
  searchAlerts = [],
  searchAlertsLoading = false,
  searchAlertsError = '',
  onRefreshSearchAlerts,
  onCreateSearchAlert,
  onUpdateSearchAlert,
  onDeleteSearchAlert,
  onAcknowledgeSearchAlert
}) {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(modeParam);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState(authUser?.displayName || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [alertQuery, setAlertQuery] = useState('');
  const [alertStyle, setAlertStyle] = useState('');
  const [alertSeason, setAlertSeason] = useState('');
  const [alertColor, setAlertColor] = useState('');
  const [alertInAppEnabled, setAlertInAppEnabled] = useState(true);
  const [alertEmailEnabled, setAlertEmailEnabled] = useState(false);

  useEffect(() => {
    setProfileDisplayName(authUser?.displayName || '');
  }, [authUser?.displayName]);

  useEffect(() => {
    setMode(modeParam);
  }, [modeParam]);

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
      onNotify?.(message);
      setPassword('');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not complete request.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const message = await onUpdateProfile({
        displayName: profileDisplayName,
        password: profilePassword || undefined
      });
      setProfilePassword('');
      setSuccess(message);
      onNotify?.(message);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const createSearchAlert = async (e) => {
    e.preventDefault();
    if (!authUser || !onCreateSearchAlert) {
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const message = await onCreateSearchAlert({
        query: alertQuery || undefined,
        style: alertStyle || undefined,
        season: alertSeason || undefined,
        color: alertColor || undefined,
        inAppEnabled: alertInAppEnabled,
        emailEnabled: alertEmailEnabled
      });
      setAlertQuery('');
      setAlertStyle('');
      setAlertSeason('');
      setAlertColor('');
      setAlertInAppEnabled(true);
      setAlertEmailEnabled(false);
      setSuccess(message);
      onNotify?.(message);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not create search alert.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAlertPreference = async (alertId, alert, field, checked) => {
    if (!onUpdateSearchAlert) {
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const message = await onUpdateSearchAlert(alertId, {
        query: alert.query || undefined,
        style: alert.style || undefined,
        season: alert.season || undefined,
        color: alert.color || undefined,
        inAppEnabled: field === 'inAppEnabled' ? checked : alert.inAppEnabled,
        emailEnabled: field === 'emailEnabled' ? checked : alert.emailEnabled
      });
      onNotify?.(message);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not update search alert.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeSearchAlert = async (alertId) => {
    if (!onDeleteSearchAlert) {
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const message = await onDeleteSearchAlert(alertId);
      onNotify?.(message);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not delete search alert.');
    } finally {
      setSubmitting(false);
    }
  };

  const acknowledgeSearchAlert = async (alertId) => {
    if (!onAcknowledgeSearchAlert) {
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const message = await onAcknowledgeSearchAlert(alertId);
      onNotify?.(message);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not acknowledge alert.');
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
          <Form className="mt-3" onSubmit={updateProfile}>
            <Form.Group className="mb-2" controlId="profile-display-name">
              <Form.Label>Display name</Form.Label>
              <Form.Control value={profileDisplayName} onChange={(e) => setProfileDisplayName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2" controlId="profile-password">
              <Form.Label>New password (optional)</Form.Label>
              <Form.Control type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} minLength={8} />
            </Form.Group>
            <Button type="submit" variant="outline-info" disabled={submitting}>{submitting ? 'Saving...' : 'Update profile'}</Button>
          </Form>
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
                <Form.Group className="mb-3" controlId="register-display-name">
                  <Form.Label>Display name</Form.Label>
                  <Form.Control value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </Form.Group>
              ) : null}
              <Form.Group className="mb-3" controlId="auth-email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="auth-password">
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
      {authUser ? (
        <Row className="mt-3">
          <Col md={8}>
            <Card bg="dark" text="light" className="p-3">
              <h5>Search alerts</h5>
              <p className="text-secondary mb-3">Save filters and receive in-app/email alerts for new matching closets.</p>
              <Form onSubmit={createSearchAlert}>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Group controlId="search-alert-query">
                      <Form.Label>Search query</Form.Label>
                      <Form.Control placeholder="e.g. winter classic" value={alertQuery} onChange={(e) => setAlertQuery(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId="search-alert-style">
                      <Form.Label>Style</Form.Label>
                      <Form.Control value={alertStyle} onChange={(e) => setAlertStyle(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId="search-alert-season">
                      <Form.Label>Season</Form.Label>
                      <Form.Control value={alertSeason} onChange={(e) => setAlertSeason(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId="search-alert-color">
                      <Form.Label>Color</Form.Label>
                      <Form.Control value={alertColor} onChange={(e) => setAlertColor(e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-3 mt-3 mb-3">
                  <Form.Check
                    id="search-alert-in-app"
                    type="switch"
                    label="In-app alerts"
                    checked={alertInAppEnabled}
                    onChange={(e) => setAlertInAppEnabled(e.target.checked)}
                  />
                  <Form.Check
                    id="search-alert-email"
                    type="switch"
                    label="Email alerts"
                    checked={alertEmailEnabled}
                    onChange={(e) => setAlertEmailEnabled(e.target.checked)}
                  />
                </div>
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="outline-info"
                    disabled={submitting || (!alertQuery.trim() && !alertStyle.trim() && !alertSeason.trim() && !alertColor.trim())}
                  >
                    Save search alert
                  </Button>
                  <Button type="button" variant="outline-light" onClick={() => onRefreshSearchAlerts?.()} disabled={submitting || searchAlertsLoading}>
                    {searchAlertsLoading ? 'Refreshing...' : 'Refresh alerts'}
                  </Button>
                </div>
              </Form>
              {searchAlertsError ? <p className="text-danger mt-3 mb-0">{searchAlertsError}</p> : null}
              {!searchAlertsLoading && !searchAlerts?.length ? <p className="text-secondary mt-3 mb-0">No saved search alerts yet.</p> : null}
              <div className="mt-3 d-grid gap-2">
                {searchAlerts?.map((alert) => (
                  <Card key={alert.id} bg="secondary" text="light" className="p-2">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <strong>{alert.query || 'Filtered search'}</strong>
                        <div className="small text-light-emphasis">
                          {[alert.style && `Style: ${alert.style}`, alert.season && `Season: ${alert.season}`, alert.color && `Color: ${alert.color}`]
                            .filter(Boolean)
                            .join(' • ') || 'No extra filters'}
                        </div>
                        <div className="small mt-1">New matches: <strong>{alert.newMatchCount || 0}</strong></div>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <Form.Check
                          id={`alert-in-app-${alert.id}`}
                          type="switch"
                          label="In-app"
                          checked={!!alert.inAppEnabled}
                          onChange={(e) => toggleAlertPreference(alert.id, alert, 'inAppEnabled', e.target.checked)}
                        />
                        <Form.Check
                          id={`alert-email-${alert.id}`}
                          type="switch"
                          label="Email"
                          checked={!!alert.emailEnabled}
                          onChange={(e) => toggleAlertPreference(alert.id, alert, 'emailEnabled', e.target.checked)}
                        />
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => acknowledgeSearchAlert(alert.id)}
                          disabled={!alert.newMatchCount}
                        >
                          Mark seen
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => removeSearchAlert(alert.id)}>Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      ) : null}
    </Container>
  );
}
