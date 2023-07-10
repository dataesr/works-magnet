import HTTPError from './http.error';

class NotFoundError extends HTTPError {
  constructor(message, errors = []) {
    super(message || 'Not found', errors);
    this.statusCode = 404;
  }
}

export default NotFoundError;
