// src/api.js
import axios from "axios";

const API_URL = "https://mydrive-git-main-saheb-kumars-projects.vercel.app/api";

// =============== AUTH ==================
export const signupUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/signup`, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
};

export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// =============== FOLDERS ==================
export const getRootFolder = async (token) => {
  const res = await axios.get(`${API_URL}/folders/root`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createFolder = async (name, parentId, token) => {
  const res = await axios.post(
    `${API_URL}/folders/create`,
    { name, parentId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getFilesInFolder = async (folderId, token) => {
  const res = await axios.get(`${API_URL}/files/file/${folderId}/getfiles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// =============== FILES ==================
export const uploadFile = async (formData, token) => {
  const res = await axios.post(`${API_URL}/files/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const renameFile = async (fileId, newName, token) => {
  const res = await axios.patch(
    `${API_URL}/files/file/${fileId}/rename`,
    { newName },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const deleteFile = async (fileId, token) => {
  const res = await axios.delete(`${API_URL}/files/file/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
