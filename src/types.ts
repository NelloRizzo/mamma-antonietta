// src/types.ts

export interface Product {
    id: number;
    name: string;
    price: number;
    color: string;
    image_url: string;
}

export interface CartItem extends Product {
    cartId: string; // ID univoco temporaneo per il carrello
}

// Struttura degli items salvati nel DB (JSONB)
export interface OrderItemDB {
    id: number;
    name: string;
    price: number;
}

export interface Order {
    id: number;
    items: OrderItemDB[]; // Nota: deve corrispondere a come il backend salva il JSON
    total_price: string; // Postgres restituisce i decimali come stringhe spesso
    status: 'pending' | 'completed';
    priority_score: number;
    created_at: string;
}