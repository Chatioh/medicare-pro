const errorHandler = require('../../src/middleware/error');
const { ValidationError, UniqueConstraintError } = require('sequelize');

describe('Error Handler Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  test('handles Sequelize ValidationError', () => {
    const err = new ValidationError('Validation error occurred', [
      { path: 'email', message: 'email must be unique' }
    ]);
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test('handles Sequelize UniqueConstraintError as ValidationError', () => {
    const err = new UniqueConstraintError({
      fields: ['email'],
      message: 'email must be unique'
    });
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test('handles generic errors with 500', () => {
    const err = new Error('Something broke');
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('uses custom status code if provided', () => {
    const err = new Error('Custom error');
    err.statusCode = 418;
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(418);
  });
});

describe('Validate Middleware', () => {
  const validate = require('../../src/middleware/validate');
  const Joi = require('joi');

  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  test('calls next() when validation passes', () => {
    const schema = Joi.object({
      name: Joi.string().required()
    });
    mockReq.body = { name: 'John' };
    const middleware = validate(schema);
    middleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('returns 400 when validation fails', () => {
    const schema = Joi.object({
      name: Joi.string().required()
    });
    mockReq.body = {};
    const middleware = validate(schema);
    middleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test('returns validation error details', () => {
    const schema = Joi.object({
      email: Joi.string().email().required()
    });
    mockReq.body = { email: 'invalid' };
    const middleware = validate(schema);
    middleware(mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
