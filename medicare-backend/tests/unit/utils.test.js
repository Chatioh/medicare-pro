const { successResponse, errorResponse } = require('../../src/utils/apiResponse');
const { generateUUID, generatePatientNumber, generateAppointmentNumber, generatePrescriptionNumber } = require('../../src/utils/generateId');

describe('apiResponse utils', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test('successResponse returns correct structure with default 200', () => {
    successResponse(mockRes, { id: 1 }, 'Success');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 },
      message: 'Success',
    });
  });

  test('successResponse accepts custom status code', () => {
    successResponse(mockRes, {}, 'Created', 201);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  test('errorResponse returns correct structure with default 500', () => {
    errorResponse(mockRes, 'Bad request');
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bad request',
    });
  });

  test('errorResponse accepts custom status code', () => {
    errorResponse(mockRes, 'Not found', 404);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('errorResponse accepts errors array', () => {
    errorResponse(mockRes, 'Validation error', 422, ['Field required']);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation error',
      errors: ['Field required'],
    });
  });
});

describe('generateId utils', () => {
  test('generateUUID returns a valid UUID string', () => {
    const id = generateUUID();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('generateUUID returns unique values', () => {
    const id1 = generateUUID();
    const id2 = generateUUID();
    expect(id1).not.toBe(id2);
  });

  test('generatePatientNumber returns correct format', () => {
    const num = generatePatientNumber();
    expect(num).toMatch(/^PAT-\d{4}-\d{4}$/);
  });

  test('generateAppointmentNumber returns correct format', () => {
    const num = generateAppointmentNumber();
    expect(num).toMatch(/^APT-\d{4}-\d{4}$/);
  });

  test('generatePrescriptionNumber returns correct format', () => {
    const num = generatePrescriptionNumber();
    expect(num).toMatch(/^RX-\d{4}-\d{4}$/);
  });

  test('generatePatientNumber includes current year', () => {
    const num = generatePatientNumber();
    const year = new Date().getFullYear().toString();
    expect(num).toContain(year);
  });
});
