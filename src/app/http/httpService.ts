import axios from "@/app/http/axios";

export default class HttpService {
  constructor() {}

  async get(path: string) {
    try {
      const response = await axios.get(`${path}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async post(path: string, payload: { [key: string]: any }) {
    try {
      const response = await axios.post(`${path}`, payload);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async put(path: string, payload: { [key: string]: any }) {
    try {
      const response = await axios.put(`${path}`, payload);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async delete(path: string) {
    try {
      const response = await axios.delete(`${path}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}
