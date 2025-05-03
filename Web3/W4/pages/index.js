/*********************************************************************************
*  WEB422 – Assignment 4
*
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Hoda Karimi   Student ID: 138611223     Date: 
*  GitHub: https://github.com/hk522/Web422A4.git
*  Render: https://web422a4-pr28.onrender.com
*
********************************************************************************/ 

// pages/index.js
import { Row, Col, Image } from 'react-bootstrap';
import ArtworkCard from '@/components/ArtworkCard';

export default function Home() {
  return (
    <>
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/3/30/Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg"
        alt="Metropolitan Museum of Art"
        fluid
        rounded
      />
      <br /><br />
      <Row>
        <Col md={6}>
          <p>
          The Metropolitan Museum of Art, colloquially referred to as the Met,
          is an encyclopedic art museum in New York City. 
          By floor area, it is the fourth-largest museum in the world and the largest art museum in the Americas. 
          With 5.36 million visitors in 2023, it is the most-visited museum in the United States and the fourth-most visited art museum in the world.
          </p>
        </Col>
        <Col md={6}>
          <p>
          The Metropolitan Museum of Art was founded in 1870 with its mission to bring art and art education to the American people.
           The museum's permanent collection consists of works of art ranging from the ancient Near East and ancient Egypt,
            through classical antiquity to the contemporary world.
          </p>
          <p>
            <a href="https://en.wikipedia.org/wiki/Metropolitan_Museum_of_Art" target="_blank" rel="noreferrer">
              Read more on Wikipedia...
            </a>
          </p>
        </Col>
      </Row>
      <br />
      <h1>Featured Artwork</h1>
      <Row>
        <Col md={4}>
          <ArtworkCard objectID={436535} /> 
        </Col>
      </Row>
    </>
  );
}
