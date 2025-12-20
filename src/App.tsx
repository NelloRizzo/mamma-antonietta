import React, { useEffect, useState } from 'react';
import './App.css';
import {
  getProducts,
  getActiveOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  socket
} from './services/api';
import { type Product, type Order, type CartItem } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'pos' | 'kitchen' | 'orders'>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Caricamento iniziale
    getProducts().then(setProducts);
    getActiveOrders().then(setOrders);

    // WebSocket Listeners
    socket.on('order:new', (newOrder: Order) => {
      setOrders(prev => [...prev, newOrder]);
    });

    socket.on('order:updated', (updated: Order) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    });

    socket.on('order:deleted', ({ id }: { id: number }) => {
      setOrders(prev => prev.filter(o => o.id !== id));
    });

    return () => {
      socket.off('order:new');
      socket.off('order:updated');
      socket.off('order:deleted');
    };
  }, []);

  const addToCart = (p: Product) => {
    setCart([...cart, { ...p, cartId: crypto.randomUUID() }]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    try {
      await createOrder(cart, total);
      setCart([]);
    } catch (err) {
      alert("Errore nell'invio ordine");
    }
  };

  const handleMarkAsDone = async (id: number) => {
    await updateOrderStatus(id, 'completed');
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm("Sei sicuro di voler eliminare definitivamente questo ordine?")) {
      await deleteOrder(id);
    }
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="brand">
          <h1>
            <img src='/favicon.ico' alt="logo" className="header-logo" />
            Lo Stand di Mamma Antonietta
          </h1>
        </div>
        <nav className="nav-tabs">
          <button className={view === 'pos' ? 'active' : ''} onClick={() => setView('pos')}>CASSA</button>
          <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>ORDINI ATTIVI</button>
          <button className={view === 'kitchen' ? 'active' : ''} onClick={() => setView('kitchen')}>CUCINA</button>
        </nav>
      </header>

      {view === 'pos' && (
        <main className="pos-container">
          <section className="menu-section">
            {products.map(p => (
              <button key={p.id} className="product-card" onClick={() => addToCart(p)}>
                <img
                  src={`./products/${p.image_url}.png`}
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                  alt={p.name}
                  className="product-image"
                />
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-price">€ {Number(p.price).toFixed(2)}</span>
                </div>
              </button>
            ))}
          </section>

          <aside className="cart-section">
            <button className="btn-submit-order" disabled={cart.length === 0} onClick={handleSendOrder}>
              🎄 INVIA ORDINE
            </button>
            <div className="total-display">Totale: € {cart.reduce((a, b) => a + Number(b.price), 0).toFixed(2)}</div>
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.cartId} className="cart-item">
                  <span>{item.name}</span>
                  <button onClick={() => removeFromCart(item.cartId)}>❌</button>
                </div>
              ))}
            </div>
          </aside>
        </main>
      )}

      {view === 'orders' && (
        <main className="orders-management">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ora</th>
                <th>Dettaglio</th>
                <th>Totale</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{o.items.map(i => i.name).join(', ')}</td>
                  <td>€ {Number(o.total_price).toFixed(2)}</td>
                  <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDeleteOrder(o.id)}>🗑️ Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {view === 'kitchen' && (
        <main className="kitchen-container">
          {orders.filter(o => o.status === 'pending').map(o => (
            <div key={o.id} className="order-ticket">
              <div className="ticket-header">
                <span className="ticket-id">#{o.id}</span>
                <span>{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <ul className="ticket-list">
                {o.items.map((item, idx) => <li key={idx}>{item.name}</li>)}
              </ul>
              <button className="btn-complete" onClick={() => handleMarkAsDone(o.id)}>PRONTO ✅</button>
            </div>
          ))}
        </main>
      )}
    </div>
  );
};

export default App;