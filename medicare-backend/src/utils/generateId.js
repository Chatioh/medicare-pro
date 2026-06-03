const { v4: uuidv4 } = require('uuid');

const generateUUID = () => {
  return uuidv4();
};

const generatePatientNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PAT-${year}-${random}`;
};

const generateAppointmentNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `APT-${year}-${random}`;
};

const generatePrescriptionNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RX-${year}-${random}`;
};

module.exports = { generateUUID, generatePatientNumber, generateAppointmentNumber, generatePrescriptionNumber };
