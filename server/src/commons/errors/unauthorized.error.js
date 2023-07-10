import HTTPError from './http.error';

class UnauthorizedError extends HTTPError {
  constructor(message, errors = []) {
    super(message || 'Unauthorized', errors);
    this.statusCode = 401;
  }
}

export default UnauthorizedError;
