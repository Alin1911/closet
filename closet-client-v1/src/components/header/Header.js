import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons'
import  Button from 'react-bootstrap/Button'
import  Container  from 'react-bootstrap/Container'
import  Nav  from 'react-bootstrap/Nav'
import  Navbar  from 'react-bootstrap/Navbar'
import { NavLink } from 'react-router-dom'

function Header({ authUser, onLogout }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
            <Navbar.Brand as={NavLink} to="/" style={{ "color" : 'gold'}}>
                <FontAwesomeIcon icon={faVideoSlash} /> Closet
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
                <Nav
                    className="mr-auto my-2 my-lg-0"
                    style={{ maxHeight: '100px' }}
                    navbarScroll
                    >
                    <NavLink className="nav-link" to="/">Home</NavLink>
                    <NavLink className="nav-link" to="/browse">Browse</NavLink>
                    <NavLink className="nav-link" to="/saved">Saved</NavLink>
                    <NavLink className="nav-link" to="/profile">Profile</NavLink>
                </Nav>
                {!authUser ? (
                  <>
                    <Button as={NavLink} to="/profile" variant="outline-info" className="me-2">Login</Button>
                    <Button as={NavLink} to="/profile" variant="outline-info" className='me-2'>Register</Button>
                  </>
                ) : (
                  <Button variant="outline-warning" className='me-2' onClick={onLogout}>Logout</Button>
                )}
            </Navbar.Collapse>
        </Container>
    </Navbar>
  )
}

export default Header
