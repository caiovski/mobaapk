import { useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ração Golden Premier 15kg',
    price: 145.90,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBszY1vG8rK44f8gM65-NqL9s0zX6V1P6w_5gWbY1D4940f8rG2Q00l8bF_2eD9F5m1bB9Qc5vC8bS5mN8qZ9mB8qX2_8vN5kC2aW9qK1lZ5bL7nF5yJ9xT6dM5nH8vF5vP0sG1bK8aL7vM5nT2mJ8jK9mV2nX7cB2_fF1yK8xL6nR8mP5gJ7yL',
    category: 'Rações',
    stock: 12
  },
  {
    id: '2',
    name: 'Tapete Higiênico 30un',
    price: 65.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6D9f7B0p3c0e5a8f4c2e7d3b1a8d5c4b9f2a7e6b0d1c8f4b5e2d7a9c3b8f1e5d4a6c9b2f7e0d3a5c8b4f1e9d2a7c6b0f5e8d3a1c4b9f2e7d6a0c5b8f3e1d9a2c7b4f6e0d5a8c1b9f3e2d7a6c0b5f8e1d4a9c2b7f',
    category: 'Higiene',
    stock: 45
  },
  {
    id: '3',
    name: 'Bravecto 10-20kg',
    price: 189.90,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuF2E8c1A9d4b7e5f3a0d6c2b8e1f4a9d7c5b3e0f2a8d1c6b9e5f4a7d3c0b8e2f1a6d9c5b4e7f3a0d2c8b1e5f9a4d7c6b0e3f2a8d1c5b9e4f7a3d0c6b8e2f1a9d5c4b7e0f3a6d2c8b1e5f9a4d7c0b3e6f2a8d1c5',
    category: 'Medicamentos',
    stock: 8
  },
  {
    id: '4',
    name: 'Shampoo Pelos Claros 500ml',
    price: 35.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuE9F4b3C8e2d1a0f7c5b6e4d9a2f1c8b3e0d7a5f4c2b9e1d6a8f3c0b5e7d2a1f9c4b6e3d8a0f5c2b7e9d4a1f6c3b8e0d5a2f7c9b4e1d6a3f8c0b5e2d7a9f4c1b6e3d8a0f5c2b7e9d4a1f6c3b8e0d5a2f7c9',
    category: 'Higiene',
    stock: 24
  },
  {
    id: '5',
    name: 'Brinquedo Osso Borracha',
    price: 22.90,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1D5a6F7e8d9c0b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4',
    category: 'Acessórios',
    stock: 15
  },
  {
    id: '6',
    name: 'Coleira Peitoral P',
    price: 45.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2B3c4D5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    category: 'Acessórios',
    stock: 10
  }
];

export default function PDVPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [cartItems, setCartItems] = useState<{product: Product, quantity: number}[]>([]);

  const categories = ['Todos', 'Rações', 'Medicamentos', 'Higiene', 'Acessórios'];

  const filteredProducts = PRODUCTS.filter(p => 
    (activeCategory === 'Todos' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return newQuantity === 0 ? item : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const total = subtotal;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-background overflow-hidden">
      
      {/* Product Catalog Section (Left) */}
      <section className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden h-full">
        {/* Search & Filter Header */}
        <div className="flex flex-col gap-4 mb-6 shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text"
              placeholder="Buscar produtos por nome, código ou código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-container text-on-primary rounded-full hover:bg-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm transition-colors ${
                  activeCategory === category
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-variant'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all group flex flex-col h-[280px]"
              >
                <div className="h-32 bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant">image</span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-secondary uppercase mb-1">{product.category}</span>
                  <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-tight flex-1">{product.name}</h3>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-lg font-bold text-primary-container">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium bg-surface-variant px-2 py-1 rounded-md">
                      Estq: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Section (Right) */}
      <section className="w-full lg:w-[400px] border-l border-outline-variant bg-surface-container-lowest flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
            Carrinho Atual
          </h2>
          <button 
            onClick={() => setCartItems([])}
            className="text-sm font-medium text-error hover:bg-error-container hover:text-on-error-container px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Limpar
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-surface">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60 gap-4">
              <span className="material-symbols-outlined text-6xl">shopping_cart</span>
              <p className="text-center font-medium">O carrinho está vazio.<br/>Adicione produtos para começar.</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-sm">
                <div className="flex-1 overflow-hidden pr-2">
                  <div className="text-sm font-semibold text-on-surface truncate">{item.product.name}</div>
                  <div className="text-sm text-on-surface-variant mt-0.5">{item.quantity} x R$ {item.product.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-outline-variant rounded-md bg-surface-container-lowest">
                    <button 
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 text-on-surface hover:text-primary transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 text-on-surface hover:text-primary transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  <div className="text-lg font-bold text-primary-container w-20 text-right">
                    R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-outline hover:text-error transition-colors p-1 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer / Total */}
        <div className="border-t border-outline-variant p-6 bg-surface-container-lowest flex flex-col gap-4">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-base font-medium">Subtotal</span>
            <span className="text-base font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant pb-3">
            <span className="text-base font-medium">Descontos</span>
            <span className="text-base font-medium text-error">- R$ 0,00</span>
          </div>
          <div className="flex justify-between items-end pt-2">
            <span className="text-2xl font-bold text-on-background">Total a Pagar</span>
            <span className="text-3xl font-bold text-primary-container">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          
          <button 
            disabled={cartItems.length === 0}
            className="w-full mt-4 bg-primary-container hover:bg-primary text-on-primary font-semibold text-lg py-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:bg-primary-container"
          >
            <span className="material-symbols-outlined">payments</span>
            Finalizar Venda
          </button>
        </div>
      </section>
    </div>
  );
}
