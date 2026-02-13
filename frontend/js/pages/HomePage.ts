export class HomePage {
    constructor() {}

    async render(): Promise<string> {
        return `
            <div class="container">
                <div class="hero-banner">
                    <h1>Коллекция виниловых пластинок</h1>
                    <p>Более 1000 редких и коллекционных изданий</p>
                </div>

                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" 
                               id="search-input" 
                               placeholder="Поиск по названию, исполнителю..."
                               data-search>
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <div class="filter-row">
                        <select id="category-filter" class="filter-select" data-filter="category">
                            <option value="">Все категории</option>
                            <option value="Rock">Rock</option>
                            <option value="Jazz">Jazz</option>
                            <option value="Classical">Classical</option>
                        </select>
                        
                        <select id="sort-select" class="filter-select" data-filter="sort">
                            <option value="">Сортировка</option>
                            <option value="price_asc">По цене (возр.)</option>
                            <option value="price_desc">По цене (убыв.)</option>
                        </select>
                        
                        <button id="apply-filters" class="btn btn-primary">
                            Применить
                        </button>
                    </div>
                </div>

                <div class="products-grid" id="products-grid">
                    <!-- Товары будут загружены через JavaScript -->
                    <div class="loading">Загрузка товаров...</div>
                </div>
            </div>
        `;
    }

    async attachEvents(): Promise<void> {
        await this.loadProducts();
    }

    private async loadProducts(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/api/products');
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            const grid = document.getElementById('products-grid');
            if (grid) {
                grid.innerHTML = '<p class="error">Ошибка загрузки товаров</p>';
            }
        }
    }

    private renderProducts(products: any[]): void {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = '<p class="empty">Товары не найдены</p>';
            return;
        }

        grid.innerHTML = products.map(product => this.renderProductCard(product)).join('');
        
        const addButtons = document.querySelectorAll('.add-to-cart');
        addButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target as HTMLElement;
                const productId = button.getAttribute('data-product-id');
                if (productId) {
                    await this.addToCart(productId);
                }
            });
        });
    }

    private renderProductCard(product: any): string {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.imageUrl || '/images/default.jpg'}" alt="${product.title}">
                    ${!product.inStock ? '<span class="out-of-stock">Нет в наличии</span>' : ''}
                </div>
                
                <div class="product-info">
                    <h3 class="product-title" data-title>${product.title}</h3>
                    <p class="product-artist">${product.artist}</p>
                    <p class="product-genre">${product.genre} • ${product.year}</p>
                    
                    <div class="product-meta">
                        <span class="product-condition ${product.condition}">
                            ${this.getConditionText(product.condition)}
                        </span>
                        <span class="product-rating">
                            <i class="fas fa-star"></i> ${product.rating}
                        </span>
                    </div>
                    
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-footer">
                        <div class="product-price" data-price>$${product.price.toFixed(2)}</div>
                        <button class="btn btn-primary add-to-cart" 
                                data-product-id="${product.id}"
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> В корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private getConditionText(condition: string): string {
        const conditions: Record<string, string> = {
            'new': 'Новая',
            'used': 'Б/у',
            'vintage': 'Винтаж'
        };
        return conditions[condition] || condition;
    }

    private async addToCart(productId: string): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId,
                    quantity: 1,
                    userId: 'temp'
                })
            });

            if (response.ok) {
                alert('Товар добавлен в корзину!');
            } else {
                alert('Ошибка при добавлении в корзину');
            }
        } catch (error) {
            alert('Ошибка при добавлении в корзину');
        }
    }
}