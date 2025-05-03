// components/Layout.js
import MainNav from './MainNav';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  return (
    <>
      <MainNav />
      <br />
      <Container>
        {children}
      </Container>
      <br />
    </>
  );
};

export default Layout;
