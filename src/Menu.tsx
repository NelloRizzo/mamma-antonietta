import React, { useEffect, useState } from 'react';
import { getProducts } from './services/api';
import { type Product } from './types';
import './Menu.css';
import favicon from '../public/favicon.ico';

const Menu: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    return (
        <div className="menu-public-container">
            <header className="menu-header">
                <div className="overlay">
                    <img src={favicon} alt="Logo" className="menu-logo" />
                    <h1>Lo Stand di Mamma Antonietta</h1>
                    <p>Il gusto della tradizione, direttamente a tavola</p>
                </div>
            </header>

            <main className="menu-content">
                {products.sort((a, b) => a.name > b.name ? 1 : -1).map(p => (
                    <div key={p.id} className="menu-item-card">
                        <div className="menu-item-image-wrapper">
                            <img
                                src={`products/${p.image_url}.png`}
                                alt={p.name}
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                            />
                        </div>
                        <div className="menu-item-details">
                            <h3>{p.name}</h3>
                            {p.ingredients && (
                                <p className="menu-item-ingredients">{p.ingredients}</p>
                            )}
                            <span className="menu-item-price">€ {Number(p.price).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </main>

            <footer className="menu-footer">
                <p>🎄 Buon Appetito! 🎄</p>
            </footer>
        </div>
    );
};

export default Menu;