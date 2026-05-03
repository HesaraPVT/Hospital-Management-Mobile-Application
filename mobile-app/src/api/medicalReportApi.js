import axios from './axios';

// Search patients by Patient ID, name, phone, or NIC
export const searchPatientsApi = (query) => 
    axios.get('/medical-reports/search/patients', { params: { query } });

// Get patient details
export const getPatientDetailsApi = (patientId) => 
    axios.get(`/medical-reports/patient/${patientId}/details`);

// Upload medical report
export const uploadMedicalReportApi = (data) => 
    axios.post('/medical-reports/upload', data);

// Get patient's reports
export const getPatientReportsApi = (patientId) => 
    axios.get(`/medical-reports/patient/${patientId}`);

// Get single medical report
export const getMedicalReportByIdApi = (reportId) => 
    axios.get(`/medical-reports/${reportId}`);

// Update medical report
export const updateMedicalReportApi = (reportId, data) => 
    axios.put(`/medical-reports/${reportId}`, data);

// Delete medical report
export const deleteMedicalReportApi = (reportId) => 
    axios.delete(`/medical-reports/${reportId}`);

// Search all patient reports (admin)
export const searchPatientReportsApi = (filters) => 
    axios.get('/medical-reports/search/all', { params: filters });
