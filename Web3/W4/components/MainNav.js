// components/MainNav.js
import { Navbar, Nav, Form, Button, FormControl } from 'react-bootstrap';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

const MainNav = () => {
  const router = useRouter();
  const [searchField, setSearchField] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/artwork?title=true&q=${searchField}`);
  };

  return (
    <>
      <Navbar className="fixed-top navbar-dark bg-primary" expand="lg">
        <Navbar.Brand>Hoda Karimi</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link>Home</Nav.Link>
            </Link>
            <Link href="/search" passHref legacyBehavior>
              <Nav.Link>Advanced Search</Nav.Link>
            </Link>
          </Nav>
          <Form className="d-flex" onSubmit={handleSubmit}>
            <FormControl
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            />
            <Button variant="outline-light" type="submit">Search</Button>
          </Form>
        </Navbar.Collapse>
      </Navbar>
      <br /><br />
    </>
  );
};

export default MainNav;
