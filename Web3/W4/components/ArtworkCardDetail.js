import useSWR from 'swr';
import Error from 'next/error';
import { Card } from 'react-bootstrap';

const fetcher = (url) => fetch(url).then((res) => res.json());

function ArtworkCardDetail({ objectID }) {
  const { data, error } = useSWR(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`,
    fetcher
  );

  if (error) return <Error statusCode={404} />;
  if (!data) return null;

  const imageUrl = data.primaryImage || null;
  const title = data.title || 'N/A';
  const date = data.objectDate || 'N/A';
  const classification = data.classification || 'N/A';
  const medium = data.medium || 'N/A';
  const artistName = data.artistDisplayName || 'N/A';
  const creditLine = data.creditLine || 'N/A';
  const dimensions = data.dimensions || 'N/A';
  const wikiUrl = data.artistWikidata_URL;

  return (
    <Card>
      {imageUrl && <Card.Img variant="top" src={imageUrl} alt={title} />}
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          Date: {date} <br />
          Classification: {classification} <br />
          Medium: {medium}
          <br />
          <br />
          Artist: {artistName} {wikiUrl && <a href={wikiUrl} target="_blank" rel="noreferrer">wiki</a>}
          <br />
          Credit Line: {creditLine}
          <br />
          Dimensions: {dimensions}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ArtworkCardDetail;
