// src/services/api.ts
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { type Order, type Product } from '../types';

// In sviluppo usa localhost, in produzione userai l'URL di Render
const API_URL = 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Singleton per il Socket
export const socket: Socket = io(API_URL);

// Funzioni API Helper
export const getProducts = async () => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
};

export const getActiveOrders = async () => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
};

export const createOrder = async (items: Product[], total: number) => {
    // Trasformiamo il carrello nel formato leggero per il DB
    const simplifiedItems = items.map(p => ({ id: p.id, name: p.name, price: p.price }));

    const response = await apiClient.post<Order>('/orders', {
        items: simplifiedItems,
        total_price: total
    });
    return response.data;
};

export const updateOrderStatus = async (id: number, status: 'completed') => {
    const response = await apiClient.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
};

export const updateOrderPriority = async (id: number, score: number) => {
    const response = await apiClient.put<Order>(`/orders/${id}/priority`, { score });
    return response.data;
};

export const deleteOrder = async (id: number) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
};