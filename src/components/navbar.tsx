import './navbar.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import BootstrapNavbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

function AppNavbar() {
  return (
    <BootstrapNavbar collapseOnSelect expand="lg" className="eco-navbar">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="eco-brand">Eco Doação</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" />
        <BootstrapNavbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/doacoes" className="eco-nav-link">Doações</Nav.Link>
            <Nav.Link as={Link} to="/ranking" className="eco-nav-link">Ranking</Nav.Link>
            <Nav.Link as={Link} to="/badgers" className="eco-nav-link">Badgers</Nav.Link>
            <NavDropdown title="Sobre" id="collapsible-nav-dropdown" className="eco-nav-dropdown">
              <NavDropdown.Item as={Link} to="/sobre">Quem somos</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sobre#github">Github</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sobre#motivacao">Motivação</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav className="align-items-center">
            <Button variant="outline-success" className="eco-btn eco-btn-outline">Entrar</Button>
            <Button variant="success" className="eco-btn eco-btn-solid ms-2">Cadastrar</Button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default AppNavbar;