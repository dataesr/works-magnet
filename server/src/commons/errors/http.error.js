class HTTPError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.statusCode = 500;
    this.errors = errors;
  }
}

export default HTTPError;
