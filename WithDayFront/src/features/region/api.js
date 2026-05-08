import axios from 'axios';

export const api = axios.create({
    baseURL: `http://${import.meta.env.VITE_BACKSERVER}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getRegion = async()=>{
    const response = await api.get('/region');
    return response.data;
}

export const getDetailRegion = async()=>{
    const response = await api.get('/detail-region');
    return response.data;
}