import HTTPError from './http.error';

class ForbiddenError extends HTTPError {
  constructor(message, errors = []) {
    super(message || 'Forbidden', errors);
    this.statusCode = 403;
  }
}

export default ForbiddenError;
