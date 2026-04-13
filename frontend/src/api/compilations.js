// src/api/compilations.js
import api from './config';

const API_URL = '/compilations';

export const getMyCompilations = async () => {
  try {
    const response = await api.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки подборок:', error);
    throw error;
  }
};

export const getCompilation = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки подборки:', error);
    throw error;
  }
};

export const createCompilation = async (data) => {
  try {
    const response = await api.post(`${API_URL}/`, data);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания подборки:', error);
    throw error;
  }
};

export const updateCompilation = async (id, data) => {
  try {
    const response = await api.put(`${API_URL}/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления подборки:', error);
    throw error;
  }
};

export const patchCompilation = async (id, data) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Ошибка частичного обновления подборки:', error);
    throw error;
  }
};

export const deleteCompilation = async (id) => {
  try {
    await api.delete(`${API_URL}/${id}/`);
    return true;
  } catch (error) {
    console.error('Ошибка удаления подборки:', error);
    throw error;
  }
};