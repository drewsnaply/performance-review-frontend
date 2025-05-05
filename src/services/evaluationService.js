// services/evaluationService.js
import axios from 'axios';

// Replace with your actual API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Get all evaluations
export const getAllEvaluations = async () => {
  try {
    const response = await axios.get(`${API_URL}/evaluations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    throw error;
  }
};

// Get a single evaluation by ID
export const getEvaluationById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/evaluations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching evaluation with ID ${id}:`, error);
    throw error;
  }
};

// Create a new evaluation
export const createEvaluation = async (evaluationData) => {
  try {
    const response = await axios.post(`${API_URL}/evaluations`, evaluationData);
    return response.data;
  } catch (error) {
    console.error('Error creating evaluation:', error);
    throw error;
  }
};

// Update an existing evaluation
export const updateEvaluation = async (id, evaluationData) => {
  try {
    const response = await axios.put(`${API_URL}/evaluations/${id}`, evaluationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating evaluation with ID ${id}:`, error);
    throw error;
  }
};

// Delete an evaluation
export const deleteEvaluation = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/evaluations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting evaluation with ID ${id}:`, error);
    throw error;
  }
};