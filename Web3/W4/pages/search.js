// pages/search.js
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Form, Button, Row, Col } from 'react-bootstrap';

export default function AdvancedSearch() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const submitForm = (data) => {
    let queryString = 'searchBy=true';
    
    if (data.geoLocation) {
      queryString += `&geoLocation=${data.geoLocation}`;
    }
    if (data.medium) {
      queryString += `&medium=${data.medium}`;
    }
    queryString += `&isOnView=${data.isOnView}`;
    queryString += `&isHighlight=${data.isHighlight}`;
    queryString += `&q=${data.q}`;

    // Redirect to artwork page with the query string
    router.push(`/artwork?${queryString}`);
  };

  return (
    <Form onSubmit={handleSubmit(submitForm)}>
      <Row>
        <Col>
          <Form.Group className="mb-3" controlId="searchBy">
            <Form.Label>Search By</Form.Label>
            <Form.Select {...register('searchBy')}>
              <option value="true">Tags</option>
              <option value="false">Title</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3" controlId="geoLocation">
            <Form.Label>Geo Location</Form.Label>
            <Form.Control type="text" placeholder="Enter Geo Location" {...register('geoLocation')} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group className="mb-3" controlId="medium">
            <Form.Label>Medium</Form.Label>
            <Form.Control type="text" placeholder="Enter Medium" {...register('medium')} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3" controlId="isOnView">
            <Form.Label>On View</Form.Label>
            <Form.Select {...register('isOnView')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group className="mb-3" controlId="isHighlight">
            <Form.Label>Highlight</Form.Label>
            <Form.Select {...register('isHighlight')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3" controlId="q">
            <Form.Label>Search Query</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Query"
              {...register('q', { required: true })}
              className={errors.q ? 'is-invalid' : ''}
            />
            {errors.q && <div className="invalid-feedback">This field is required.</div>}
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">Search</Button>
    </Form>
  );
}
