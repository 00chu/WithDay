import axios from 'axios';

export const api = axios.create({
    baseURL: `http://${import.meta.env.VITE_BACKSERVER}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getRegion = async () => {
     try {
        const response = await api.get(`/region`);
        return response.data;
    } catch (e) {
        console.log(e);
        return [];
    }
};

export const getDetailRegion = async(regionName)=>{
    const response = await api.get(`/region/detail-region`, {
        params: { regionName },
    });
    console.log(response)
    return response.data;
}