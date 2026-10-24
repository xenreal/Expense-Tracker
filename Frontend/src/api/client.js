import { Summary } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

const buildQuery = (params = {}) => {
    const query  = new URLSearchParams();
    Object.entries(params).forEach(([Key,value]) => {
        if (value !== null && value !== undefined && value !== ""){
            query.append(Key,value);
        }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
};

export const getTransactions = async (params = {}) => {
    const response = await fetch(`${BASE_URL}/transactions${buildQuery(params)}`);

    if (!response.ok) {
        const errorData = await response.json().catch(()=>({}));
        throw new Error(errorData.detail || "Failed to fetch transactions");
    }

    return response.json()
};

export const uploadStatement = async (file , password = null) => {
    const formData = new FormData();
    formData.append("file" , file);

    if (password){
        formData.append("password" , password);
    }

    const response = await fetch(`${BASE_URL}/transactions/upload` , {
        method: "POST",
        body: formData,
    });

    if (!response.ok){
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to upload the statement");
    }

    return response.json();
};

export const getSummary = async (params = {}) => {
    const response = await fetch(`${BASE_URL}/transactions/summary${buildQuery(params)}`);

    if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch summary");
}
    return response.json();
};

export const getTopPayee = async (params={}) => {
    const response = await fetch(`${BASE_URL}/transactions/payee${buildQuery(params)}`);

    if (!response.ok){
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch top payees")
    }

    return response.json();
};