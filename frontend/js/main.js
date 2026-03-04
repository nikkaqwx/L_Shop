const AppState = {
    user: null,
    cart: [],
    products: [],
    orders: [],
    filterOptions: {},
    filters: {
        search: '',
        category: 'all',
        genre: 'all',
        condition: 'all',
        inStock: 'all',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        sort: 'name_asc'
    }
};

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 400 400\'%3E%3Crect width=\'400\' height=\'400\' fill=\'%237c3aed\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-size=\'24\' font-family=\'Arial\'%3EVinyl%3C/text%3E%3C/svg%3E';

function getProductImage(index, productTitle) {
    const albumImages = {
        'The Dark Side of the Moon': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&h=600&fit=crop&auto=format',
        'Kind of Blue': 'https://images.unsplash.com/photo-1598387993499-40ad4d2f5b6c?w=600&h=600&fit=crop&auto=format',
        'Abbey Road': 'https://images.unsplash.com/photo-1571974599782-87624638275d?w=600&h=600&fit=crop&auto=format',
        'Thriller': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop&auto=format',
        'Back in Black': 'https://images.unsplash.com/photo-1595769812725-4c6564f70466?w=600&h=600&fit=crop&auto=format',
        'The Wall': 'https://images.unsplash.com/photo-1585771724680-0573be5850b6?w=600&h=600&fit=crop&auto=format',
        'Blue': 'https://images.unsplash.com/photo-1566489564590-8d4cc8da00c4?w=600&h=600&fit=crop&auto=format',
        'Led Zeppelin IV': 'https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=600&h=600&fit=crop&auto=format'
    };
    
    if (productTitle && albumImages[productTitle]) {
        return albumImages[productTitle];
    }
    
    const generalImages = [
        'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&h=600&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&h=600&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1598387993499-40ad4d2f5b6c?w=600&h=600&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1571974599782-87624638275d?w=600&h=600&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop&auto=format'
    ];
    
    return generalImages[index % generalImages.length];
}

let currentPage = 'home';

async function initApp() {
    console.log('Инициализация приложения...');
    
    const app = document.getElementById('app');
    if (!app) return;

    try {
        app.innerHTML = `
            <div class="loading text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <h3 class="mt-3">Загрузка приложения...</h3>
            </div>
        `;

        try {
            const healthCheck = await fetch('/api/health');
            if (!healthCheck.ok) {
                throw new Error('API не отвечает');
            }
            console.log('✅ API работает');
        } catch (error) {
            console.error('❌ API недоступен:', error);
            app.innerHTML = `
                <div class="container mt-5 text-center">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <h3>Ошибка подключения к серверу</h3>
                        <p>Убедитесь, что сервер запущен на порту 3000</p>
                        <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                            <i class="fas fa-redo me-2"></i>Обновить
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        await Promise.all([
            loadUser().catch(err => console.warn('Ошибка загрузки пользователя:', err)),
            loadFilterOptions().catch(err => console.warn('Ошибка загрузки фильтров:', err)),
            loadProducts().catch(err => console.warn('Ошибка загрузки товаров:', err)),
            loadCart().catch(err => console.warn('Ошибка загрузки корзины:', err))
        ]);

        await renderApp();
        
    } catch (error) {
        console.error('Критическая ошибка:', error);
        app.innerHTML = `
            <div class="container mt-5 text-center">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h3>Ошибка загрузки приложения</h3>
                    <p>${error.message || 'Неизвестная ошибка'}</p>
                    <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                        <i class="fas fa-redo me-2"></i>Обновить
                    </button>
                </div>
            </div>
        `;
    }
}

async function loadUser() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        if (response.ok) {
            AppState.user = await response.json();
        }
    } catch (error) {
        console.log('Пользователь не авторизован');
    }
}

async function loadFilterOptions() {
    try {
        const response = await fetch('/api/products/filter-options');
        if (response.ok) {
            AppState.filterOptions = await response.json();
        }
    } catch (error) {
        console.error('Ошибка загрузки опций фильтрации:', error);
    }
}

async function loadProducts() {
    try {
        const params = new URLSearchParams();
        
        if (AppState.filters.search) params.append('search', AppState.filters.search);
        if (AppState.filters.category !== 'all') params.append('category', AppState.filters.category);
        if (AppState.filters.genre !== 'all') params.append('genre', AppState.filters.genre);
        if (AppState.filters.condition !== 'all') params.append('condition', AppState.filters.condition);
        if (AppState.filters.inStock !== 'all') params.append('inStock', AppState.filters.inStock);
        if (AppState.filters.minPrice) params.append('minPrice', AppState.filters.minPrice);
        if (AppState.filters.maxPrice) params.append('maxPrice', AppState.filters.maxPrice);
        if (AppState.filters.minYear) params.append('minYear', AppState.filters.minYear);
        if (AppState.filters.maxYear) params.append('maxYear', AppState.filters.maxYear);
        if (AppState.filters.sort) params.append('sort', AppState.filters.sort);
        
        const queryString = params.toString();
        const url = queryString ? `/api/products?${queryString}` : '/api/products';
        const response = await fetch(url);
        
        if (response.ok) {
            AppState.products = await response.json();
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

async function loadCart() {
    if (!AppState.user) return;
    try {
        const response = await fetch(`/api/cart?userId=${AppState.user.id}`, {
            credentials: 'include'
        });
        if (response.ok) {
            AppState.cart = await response.json();
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

async function loadOrders() {
    if (!AppState.user) {
        AppState.orders = [];
        return;
    }
    try {
        const response = await fetch(`/api/orders?userId=${AppState.user.id}`, {
            credentials: 'include'
        });
        if (response.ok) {
            AppState.orders = await response.json();
        } else {
            AppState.orders = [];
        }
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        AppState.orders = [];
    }
}

async function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a href="#" class="navbar-brand" onclick="handleHomeClick(event)">
                    <i class="fas fa-record-vinyl me-2"></i>
                    VinylShop
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a href="#" class="nav-link" onclick="handleHomeClick(event)">
                                <i class="fas fa-home me-1"></i> Главная
                            </a>
                        </li>
                        ${AppState.user ? `
                            <li class="nav-item">
                                <a href="#" class="nav-link position-relative" onclick="handleCartClick(event)">
                                    <i class="fas fa-shopping-cart me-1"></i> Корзина
                                    ${AppState.cart.length > 0 ? `
                                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            ${getTotalCartItems()}
                                        </span>
                                    ` : ''}
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="nav-link" onclick="handleOrdersClick(event)">
                                    <i class="fas fa-box me-1"></i> Заказы
                                </a>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-user me-1"></i> ${AppState.user.username}
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="handleLogout()">Выйти</a></li>
                                </ul>
                            </li>
                        ` : `
                            <li class="nav-item">
                                <button class="btn btn-outline-light me-2" onclick="showAuthModal('login')">
                                    Войти
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="btn btn-primary" onclick="showAuthModal('register')">
                                    Регистрация
                                </button>
                            </li>
                        `}
                    </ul>
                </div>
            </div>
        </nav>
        
        <main class="main-content py-4">
            <div class="container">
                ${await renderContent()}
            </div>
        </main>
        
        <footer class="bg-dark text-white py-4 mt-5">
            <div class="container text-center">
                <p>&copy; 2026 VinylShop. Все права защищены.</p>
            </div>
        </footer>
        
        <div id="modals"></div>
        <div id="notifications"></div>
    `;

    attachEventListeners();
}

async function renderContent() {
    if (currentPage === 'cart') {
        return renderCartPage();
    }
    if (currentPage === 'orders') {
        await loadOrders();
        return renderOrdersPage();
    }
    return renderHomePage();
}

function renderHomePage() {
    return `
        <div class="home-page">
            <div class="hero-banner text-center py-5 mb-5 bg-primary text-white rounded">
                <h1 class="display-4 fw-bold">Коллекция виниловых пластинок</h1>
                <p class="lead">Более 1000 редких и коллекционных изданий</p>
            </div>

            <div class="filters-section card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-12 mb-3">
                            <div class="input-group">
                                <input type="text" 
                                       id="search-input" 
                                       class="form-control" 
                                       placeholder="Поиск по названию, исполнителю, жанру..."
                                       value="${AppState.filters.search}">
                                <button class="btn btn-primary" onclick="handleApplyFilters()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="col-md-3">
                            <label class="form-label">Категория</label>
                            <select id="category-filter" class="form-select">
                                <option value="all">Все категории</option>
                                ${AppState.filterOptions.categories ? AppState.filterOptions.categories.map(cat => 
                                    `<option value="${cat}" ${AppState.filters.category === cat ? 'selected' : ''}>${cat}</option>`
                                ).join('') : ''}
                            </select>
                        </div>
                        
                        <div class="col-md-3">
                            <label class="form-label">Жанр</label>
                            <select id="genre-filter" class="form-select">
                                <option value="all">Все жанры</option>
                                ${AppState.filterOptions.genres ? AppState.filterOptions.genres.map(genre => 
                                    `<option value="${genre}" ${AppState.filters.genre === genre ? 'selected' : ''}>${genre}</option>`
                                ).join('') : ''}
                            </select>
                        </div>
                        
                        <div class="col-md-3">
                            <label class="form-label">Состояние</label>
                            <select id="condition-filter" class="form-select">
                                <option value="all">Любое состояние</option>
                                ${AppState.filterOptions.conditions ? AppState.filterOptions.conditions.map(cond => 
                                    `<option value="${cond}" ${AppState.filters.condition === cond ? 'selected' : ''}>
                                        ${getConditionText(cond)}
                                    </option>`
                                ).join('') : ''}
                            </select>
                        </div>
                        
                        <div class="col-md-3">
                            <label class="form-label">Наличие</label>
                            <select id="stock-filter" class="form-select">
                                <option value="all">Все товары</option>
                                <option value="true" ${AppState.filters.inStock === 'true' ? 'selected' : ''}>В наличии</option>
                                <option value="false" ${AppState.filters.inStock === 'false' ? 'selected' : ''}>Нет в наличии</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6">
                            <label class="form-label">Цена</label>
                            <div class="row g-2">
                                <div class="col">
                                    <input type="number" id="min-price" class="form-control" placeholder="От" 
                                           value="${AppState.filters.minPrice}" min="0">
                                </div>
                                <div class="col-auto">
                                    <span class="form-control-plaintext">-</span>
                                </div>
                                <div class="col">
                                    <input type="number" id="max-price" class="form-control" placeholder="До" 
                                           value="${AppState.filters.maxPrice}" min="0">
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <label class="form-label">Год выпуска</label>
                            <div class="row g-2">
                                <div class="col">
                                    <input type="number" id="min-year" class="form-control" placeholder="От" 
                                           value="${AppState.filters.minYear}" min="1950" max="2024">
                                </div>
                                <div class="col-auto">
                                    <span class="form-control-plaintext">-</span>
                                </div>
                                <div class="col">
                                    <input type="number" id="max-year" class="form-control" placeholder="До" 
                                           value="${AppState.filters.maxYear}" min="1950" max="2024">
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-12">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <label class="form-label me-2">Сортировка:</label>
                                    <select id="sort-filter" class="form-select d-inline-block w-auto">
                                        <option value="name_asc" ${AppState.filters.sort === 'name_asc' ? 'selected' : ''}>По названию (А-Я)</option>
                                        <option value="name_desc" ${AppState.filters.sort === 'name_desc' ? 'selected' : ''}>По названию (Я-А)</option>
                                        <option value="price_asc" ${AppState.filters.sort === 'price_asc' ? 'selected' : ''}>По цене (возрастание)</option>
                                        <option value="price_desc" ${AppState.filters.sort === 'price_desc' ? 'selected' : ''}>По цене (убывание)</option>
                                        <option value="year_asc" ${AppState.filters.sort === 'year_asc' ? 'selected' : ''}>По году (старые)</option>
                                        <option value="year_desc" ${AppState.filters.sort === 'year_desc' ? 'selected' : ''}>По году (новые)</option>
                                        <option value="rating_desc" ${AppState.filters.sort === 'rating_desc' ? 'selected' : ''}>По рейтингу</option>
                                    </select>
                                </div>
                                <div>
                                    <button class="btn btn-secondary me-2" onclick="handleResetFilters()">
                                        <i class="fas fa-redo"></i> Сбросить фильтры
                                    </button>
                                    <button class="btn btn-primary" onclick="handleApplyFilters()">
                                        <i class="fas fa-filter"></i> Применить
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="products-info mb-3">
                <div class="alert alert-info">
                    Найдено товаров: <strong>${AppState.products.length}</strong>
                </div>
            </div>

            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4" id="products-grid">
                ${renderProducts()}
            </div>
        </div>
    `;
}

function renderProducts() {
    if (!AppState.products || AppState.products.length === 0) {
        return `
            <div class="col-12">
                <div class="alert alert-warning text-center py-5">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <h3>Товары не найдены</h3>
                    <p class="mb-0">Попробуйте изменить параметры поиска</p>
                </div>
            </div>
        `;
    }

    return AppState.products.map((product, index) => {
        const imageUrl = getProductImage(index, product.title);
        
        return `
            <div class="col">
                <div class="card h-100 product-card" data-product-id="${product.id}">
                    <div class="position-relative">
                        <img src="${imageUrl}" 
                             class="card-img-top" 
                             alt="${product.title}"
                             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&h=600&fit=crop&auto=format';"
                             style="height: 250px; object-fit: cover;">
                        ${!product.inStock ? `
                            <span class="badge bg-danger position-absolute top-0 end-0 m-2">Нет в наличии</span>
                        ` : ''}
                        ${product.condition === 'vintage' ? `
                            <span class="badge bg-warning position-absolute top-0 start-0 m-2">Винтаж</span>
                        ` : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title" data-title>${product.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${product.artist}</h6>
                        <p class="card-text small text-muted">${product.genre} • ${product.year} • ${product.category}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-info">${getConditionText(product.condition)}</span>
                            <span class="text-warning">
                                <i class="fas fa-star"></i> ${product.rating ? product.rating.toFixed(1) : '0.0'}
                            </span>
                        </div>
                        
                        <p class="card-text flex-grow-1" style="font-size: 0.9rem;">
                            ${product.description || 'Нет описания'}
                        </p>
                        
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <div class="h4 mb-0 text-primary" data-price>
                                $${product.price ? product.price.toFixed(2) : '0.00'}
                            </div>
                            <button class="btn btn-primary add-to-cart" 
                                    data-product-id="${product.id}"
                                    ${!product.inStock ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus"></i> В корзину
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCartPage() {
    if (!AppState.user) {
        return `
            <div class="text-center py-5">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h3>Для просмотра корзины необходимо войти</h3>
                    <button class="btn btn-primary mt-3" onclick="showAuthModal('login')">
                        Войти
                    </button>
                </div>
            </div>
        `;
    }

    if (AppState.cart.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                <h2>Корзина пуста</h2>
                <p class="text-muted">Добавьте товары из каталога</p>
                <button class="btn btn-primary" onclick="handleHomeClick(event)">
                    <i class="fas fa-shopping-bag me-2"></i> Перейти к покупкам
                </button>
            </div>
        `;
    }

    const totalPrice = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = getTotalCartItems();

    return `
        <div class="cart-page">
            <h1 class="mb-4"><i class="fas fa-shopping-cart me-2"></i>Корзина</h1>
            
            <div class="cart-items mb-4">
                ${AppState.cart.map((item, index) => {
                    const imageUrl = getProductImage(index, item.title);
                    
                    return `
                        <div class="card mb-3 cart-item" data-product-id="${item.id}">
                            <div class="row g-0">
                                <div class="col-md-2">
                                    <img src="${imageUrl}" 
                                         class="img-fluid rounded-start" 
                                         alt="${item.title}"
                                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200&h=200&fit=crop&auto=format';"
                                         style="height: 150px; object-fit: cover;">
                                </div>
                                <div class="col-md-7">
                                    <div class="card-body">
                                        <h5 class="card-title cart-item-title" data-title="basket">${item.title}</h5>
                                        <h6 class="card-subtitle mb-2 text-muted">${item.artist}</h6>
                                        <p class="card-text small">${item.genre} • ${item.year} • ${getConditionText(item.condition)}</p>
                                        
                                        <div class="cart-item-controls mt-3">
                                            <div class="d-flex align-items-center">
                                                <div class="input-group" style="width: 150px;">
                                                    <button class="btn btn-outline-secondary" 
                                                            onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">
                                                        <i class="fas fa-minus"></i>
                                                    </button>
                                                    <input type="number" 
                                                           class="form-control text-center" 
                                                           value="${item.quantity}" 
                                                           min="1"
                                                           onchange="updateCartItemQuantity('${item.id}', this.value)">
                                                    <button class="btn btn-outline-secondary" 
                                                            onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">
                                                        <i class="fas fa-plus"></i>
                                                    </button>
                                                </div>
                                                <button class="btn btn-outline-danger ms-3" 
                                                        onclick="removeFromCart('${item.id}')">
                                                    <i class="fas fa-trash"></i> Удалить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 d-flex flex-column justify-content-center align-items-end p-3">
                                    <div class="text-end">
                                        <div class="text-muted small">Цена за шт.</div>
                                        <div class="h5 mb-2">$${item.price.toFixed(2)}</div>
                                        <div class="text-muted small">Сумма</div>
                                        <div class="h4 text-primary cart-item-price" data-price="basket">
                                            $${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="card cart-summary">
                <div class="card-body">
                    <h5 class="card-title mb-4">Сводка заказа</h5>
                    
                    <div class="summary-row d-flex justify-content-between mb-2">
                        <span>Товаров:</span>
                        <span>${totalItems} шт.</span>
                    </div>
                    <div class="summary-row d-flex justify-content-between mb-2">
                        <span>Общая стоимость:</span>
                        <span>$${totalPrice.toFixed(2)}</span>
                    </div>
                    <hr>
                    <div class="summary-row d-flex justify-content-between fw-bold fs-5">
                        <span>Итого к оплате:</span>
                        <span class="text-primary">$${totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <button class="btn btn-primary btn-lg w-100 mt-4" onclick="showDeliveryModal()">
                        <i class="fas fa-truck me-2"></i> Оформить доставку
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderOrdersPage() {
    if (!AppState.user) {
        return `
            <div class="text-center py-5">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h3>Для просмотра заказов необходимо войти</h3>
                    <button class="btn btn-primary mt-3" onclick="showAuthModal('login')">
                        Войти
                    </button>
                </div>
            </div>
        `;
    }
    
    const orders = AppState.orders || [];
    
    if (orders.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <h2>У вас пока нет заказов</h2>
                <p class="text-muted">Совершите свою первую покупку!</p>
                <button class="btn btn-primary" onclick="handleHomeClick(event)">
                    <i class="fas fa-shopping-bag me-2"></i> Перейти к покупкам
                </button>
            </div>
        `;
    }

    return `
        <div class="orders-page">
            <h1 class="mb-4"><i class="fas fa-box me-2"></i>Мои заказы</h1>
            <p class="text-muted mb-4">Всего заказов: ${orders.length}</p>
            
            <div class="orders-list">
                ${orders.map(order => {
                    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
                    const formattedDate = orderDate.toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    let address = 'Адрес не указан';
                    if (order.shippingAddress) {
                        if (typeof order.shippingAddress === 'string') {
                            address = order.shippingAddress;
                        } else if (typeof order.shippingAddress === 'object') {
                            const addrParts = [
                                order.shippingAddress.street,
                                order.shippingAddress.city,
                                order.shippingAddress.country
                            ].filter(Boolean);
                            address = addrParts.join(', ');
                        }
                    }
                    
                    const orderId = order.id || order._id || 'N/A';
                    const shortOrderId = orderId.substring(0, 8).toUpperCase();
                    const orderItems = order.items || order.products || [];
                    const totalAmount = order.totalAmount || order.total || 0;
                    
                    return `
                        <div class="card mb-4 order-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-0">Заказ #${shortOrderId}</h5>
                                    <small class="text-muted">${formattedDate}</small>
                                </div>
                                <span class="badge ${getOrderStatusBadge(order.status)}">
                                    ${getOrderStatusText(order.status || 'pending')}
                                </span>
                            </div>
                            
                            <div class="card-body">
                                <div class="order-items mb-3">
                                    <h6 class="mb-3">Товары:</h6>
                                    ${orderItems.length > 0 ? 
                                        orderItems.map(item => {
                                            const itemName = item.productTitle || item.name || item.title || 'Товар';
                                            const quantity = item.quantity || 1;
                                            const price = item.price || 0;
                                            return `
                                                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                                                    <span>${itemName} × ${quantity}</span>
                                                    <span class="fw-bold">$${price.toFixed(2)}</span>
                                                </div>
                                            `;
                                        }).join('') :
                                        '<p class="text-muted">Товары не указаны</p>'
                                    }
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center border-top pt-3">
                                    <div class="order-details">
                                        <div class="mb-1">
                                            <i class="fas fa-map-marker-alt text-muted me-2"></i>
                                            <small>${address}</small>
                                        </div>
                                        ${order.paymentMethod ? `
                                            <div>
                                                <i class="fas fa-credit-card text-muted me-2"></i>
                                                <small>Оплата: ${getPaymentMethodText(order.paymentMethod)}</small>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="text-end">
                                        <div class="text-muted small">Итого:</div>
                                        <div class="h4 text-primary">$${totalAmount.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function showAuthModal(mode) {
    const isLogin = mode === 'login';
    
    const modalHTML = `
        <div class="modal fade show" id="auth-modal" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h5>
                        <button type="button" class="btn-close" onclick="closeModal()"></button>
                    </div>
                    <div class="modal-body">
                        <form id="auth-form" data-registration="${!isLogin}">
                            ${!isLogin ? `
                                <div class="mb-3">
                                    <label class="form-label">Имя пользователя *</label>
                                    <input type="text" name="username" class="form-control" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Телефон *</label>
                                    <input type="tel" name="phone" class="form-control" required>
                                </div>
                            ` : ''}
                            
                            <div class="mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" name="email" class="form-control" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Пароль *</label>
                                <input type="password" name="password" class="form-control" required minlength="6">
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100">
                                ${isLogin ? 'Войти' : 'Зарегистрироваться'}
                            </button>
                            
                            <div class="text-center mt-3">
                                <a href="#" onclick="toggleAuthMode(event, '${isLogin ? 'register' : 'login'}')">
                                    ${isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalsContainer = document.getElementById('modals');
    modalsContainer.innerHTML = modalHTML;
    
    const form = document.getElementById('auth-form');
    if (form) {
        form.addEventListener('submit', (e) => handleAuthSubmit(e, mode));
    }
}

function showDeliveryModal() {
    const totalPrice = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = totalPrice > 50 ? 0 : 5.99;
    
    const captcha = generateCaptcha();
    window.currentCaptcha = captcha.answer;
    
    const modalHTML = `
        <div class="modal fade show" id="delivery-modal" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Оформление доставки</h5>
                        <button type="button" class="btn-close" onclick="closeModal()"></button>
                    </div>
                    <div class="modal-body">
                        <form id="delivery-form" data-delivery>
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Данные доставки</h6>
                                    
                                    <div class="row mb-3">
                                        <div class="col">
                                            <input type="text" name="firstName" class="form-control" placeholder="Имя *" required 
                                                   value="${AppState.user?.username?.split(' ')[0] || ''}">
                                        </div>
                                        <div class="col">
                                            <input type="text" name="lastName" class="form-control" placeholder="Фамилия *" required>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <input type="text" name="street" class="form-control" placeholder="Улица и дом *" required>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col">
                                            <input type="text" name="city" class="form-control" placeholder="Город *" required>
                                        </div>
                                        <div class="col">
                                            <input type="text" name="zipCode" class="form-control" placeholder="Индекс *" required>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <select name="country" class="form-select" required>
                                            <option value="">Страна *</option>
                                            <option value="Россия">Россия</option>
                                            <option value="Беларусь">Беларусь</option>
                                            <option value="Казахстан">Казахстан</option>
                                            <option value="Украина">Украина</option>
                                        </select>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col">
                                            <input type="tel" name="phone" class="form-control" placeholder="Телефон *" required 
                                                   value="${AppState.user?.phone || ''}">
                                        </div>
                                        <div class="col">
                                            <input type="email" name="email" class="form-control" placeholder="Email *" required 
                                                   value="${AppState.user?.email || ''}">
                                        </div>
                                    </div>
                                    
                                    <h6 class="mt-4">Способ оплаты</h6>
                                    <div class="mb-3">
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="radio" name="payment" value="card" id="card-payment" checked>
                                            <label class="form-check-label" for="card-payment">
                                                <i class="fas fa-credit-card me-2"></i> Банковская карта
                                            </label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="radio" name="payment" value="cash" id="cash-payment">
                                            <label class="form-check-label" for="cash-payment">
                                                <i class="fas fa-money-bill-wave me-2"></i> Наличные при получении
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="payment" value="online" id="online-payment">
                                            <label class="form-check-label" for="online-payment">
                                                <i class="fas fa-globe me-2"></i> Онлайн-перевод
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <h6>Сводка заказа</h6>
                                    
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <h6>Товары (${getTotalCartItems()} шт.)</h6>
                                            ${AppState.cart.slice(0, 3).map((item, index) => {
                                                const imageUrl = getProductImage(index + 100);
                                                return `
                                                    <div class="d-flex align-items-center mb-2">
                                                        <img src="${imageUrl}" 
                                                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" 
                                                             alt="${item.title}">
                                                        <div class="ms-2 flex-grow-1 d-flex justify-content-between">
                                                            <span class="small">${item.title}</span>
                                                            <span class="small fw-bold">×${item.quantity}</span>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                            ${AppState.cart.length > 3 ? `
                                                <div class="text-muted small text-center">
                                                    ...и еще ${AppState.cart.length - 3} товар(ов)
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Товары:</span>
                                            <span>$${totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Доставка:</span>
                                            <span class="${shippingCost === 0 ? 'text-success fw-bold' : ''}">
                                                ${shippingCost === 0 ? 'Бесплатно' : `$${shippingCost.toFixed(2)}`}
                                            </span>
                                        </div>
                                        <hr>
                                        <div class="d-flex justify-content-between fw-bold">
                                            <span>Итого:</span>
                                            <span class="text-primary">$${(totalPrice + shippingCost).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Капча для подтверждения</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light fw-bold">
                                                ${captcha.text}
                                            </span>
                                            <input type="text" 
                                                   name="captcha" 
                                                   class="form-control" 
                                                   placeholder="Введите ответ" 
                                                   required>
                                            <button class="btn btn-outline-secondary" type="button" onclick="refreshCaptcha()">
                                                <i class="fas fa-redo"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="form-check mb-4">
                                        <input class="form-check-input" type="checkbox" id="terms" name="terms" required>
                                        <label class="form-check-label" for="terms">
                                            Согласен с <a href="#" onclick="showTermsModal()">условиями обработки данных</a>
                                        </label>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary w-100 btn-lg">
                                        <i class="fas fa-check me-2"></i> Подтвердить заказ
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalsContainer = document.getElementById('modals');
    modalsContainer.innerHTML = modalHTML;
    
    const form = document.getElementById('delivery-form');
    if (form) {
        form.addEventListener('submit', (e) => handleDeliverySubmit(e));
    }
}

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch (operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
    }
    
    return {
        text: `${num1} ${operator} ${num2} = ?`,
        answer: answer.toString()
    };
}

function refreshCaptcha() {
    const captcha = generateCaptcha();
    window.currentCaptcha = captcha.answer;
    
    const captchaElement = document.querySelector('.input-group-text');
    if (captchaElement) {
        captchaElement.textContent = captcha.text;
    }
    
    const captchaInput = document.querySelector('input[name="captcha"]');
    if (captchaInput) {
        captchaInput.value = '';
    }
}

function showTermsModal() {
    const modalHTML = `
        <div class="modal fade show" id="terms-modal" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Условия обработки персональных данных</h5>
                        <button type="button" class="btn-close" onclick="closeModal()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="terms-content" style="max-height: 400px; overflow-y: auto;">
                            <p><strong>1. Согласие на обработку персональных данных</strong></p>
                            <p>Предоставляя свои персональные данные, вы соглашаетесь на их обработку в целях выполнения заказа.</p>
                            
                            <p><strong>2. Какие данные мы собираем</strong></p>
                            <p>- Имя и контактные данные для доставки<br>
                            - Адрес доставки<br>
                            - Информация о заказе</p>
                            
                            <p><strong>3. Как мы используем данные</strong></p>
                            <p>Данные используются исключительно для обработки и доставки вашего заказа.</p>
                            
                            <p><strong>4. Защита данных</strong></p>
                            <p>Мы обеспечиваем защиту ваших персональных данных в соответствии с законодательством.</p>
                        </div>
                        <button class="btn btn-primary w-100 mt-3" onclick="closeModal()">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalsContainer = document.getElementById('modals');
    modalsContainer.innerHTML = modalHTML;
}

function getConditionText(condition) {
    const conditions = {
        'new': 'Новая',
        'used': 'Б/У',
        'vintage': 'Винтаж'
    };
    return conditions[condition] || condition;
}

function getOrderStatusText(status) {
    const statuses = {
        'pending': 'Ожидает',
        'processing': 'Обрабатывается',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statuses[status] || status;
}

function getOrderStatusBadge(status) {
    const badges = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'shipped': 'bg-primary',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
}

function getPaymentMethodText(method) {
    const methods = {
        'card': 'Банковская карта',
        'cash': 'Наличные при получении',
        'online': 'Онлайн-перевод'
    };
    return methods[method] || method;
}

function getTotalCartItems() {
    return AppState.cart.reduce((total, item) => total + item.quantity, 0);
}

function attachEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleApplyFilters();
            }
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function handleSearch(e) {
    AppState.filters.search = e.target.value;
    await handleApplyFilters();
}

async function handleApplyFilters() {
    AppState.filters.category = document.getElementById('category-filter')?.value || 'all';
    AppState.filters.genre = document.getElementById('genre-filter')?.value || 'all';
    AppState.filters.condition = document.getElementById('condition-filter')?.value || 'all';
    AppState.filters.inStock = document.getElementById('stock-filter')?.value || 'all';
    AppState.filters.minPrice = document.getElementById('min-price')?.value || '';
    AppState.filters.maxPrice = document.getElementById('max-price')?.value || '';
    AppState.filters.minYear = document.getElementById('min-year')?.value || '';
    AppState.filters.maxYear = document.getElementById('max-year')?.value || '';
    AppState.filters.sort = document.getElementById('sort-filter')?.value || 'name_asc';
    
    await loadProducts();
    await renderApp();
}

async function handleResetFilters() {
    AppState.filters = {
        search: '',
        category: 'all',
        genre: 'all',
        condition: 'all',
        inStock: 'all',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        sort: 'name_asc'
    };
    
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const genreFilter = document.getElementById('genre-filter');
    const conditionFilter = document.getElementById('condition-filter');
    const stockFilter = document.getElementById('stock-filter');
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    const minYear = document.getElementById('min-year');
    const maxYear = document.getElementById('max-year');
    const sortFilter = document.getElementById('sort-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    if (genreFilter) genreFilter.value = 'all';
    if (conditionFilter) conditionFilter.value = 'all';
    if (stockFilter) stockFilter.value = 'all';
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    if (minYear) minYear.value = '';
    if (maxYear) maxYear.value = '';
    if (sortFilter) sortFilter.value = 'name_asc';
    
    await loadProducts();
    await renderApp();
    
    showNotification('Фильтры сброшены', 'success');
}

async function handleAddToCart(e) {
    const button = e.target.closest('.add-to-cart');
    const productId = button.getAttribute('data-product-id');
    
    if (!AppState.user) {
        showNotification('Для добавления в корзину необходимо войти в систему', 'error');
        showAuthModal('login');
        return;
    }
    
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                productId,
                quantity: 1,
                userId: AppState.user.id
            })
        });

        if (response.ok) {
            await loadCart();
            await renderApp();
            showNotification('Товар добавлен в корзину!', 'success');
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        showNotification('Ошибка при добавлении в корзину', 'error');
    }
}

async function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        await removeFromCart(productId);
        return;
    }
    
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                quantity: parseInt(newQuantity),
                userId: AppState.user.id
            })
        });

        if (response.ok) {
            await loadCart();
            await renderApp();
        }
    } catch (error) {
        showNotification('Ошибка обновления корзины', 'error');
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                userId: AppState.user.id
            })
        });

        if (response.ok) {
            await loadCart();
            await renderApp();
            showNotification('Товар удален из корзины', 'success');
        }
    } catch (error) {
        showNotification('Ошибка удаления из корзины', 'error');
    }
}

async function handleAuthSubmit(e, mode) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(mode === 'login' ? 
                { email: data.email, password: data.password } :
                {
                    username: data.username,
                    email: data.email,
                    phone: data.phone,
                    password: data.password
                })
        });

        if (response.ok) {
            const result = await response.json();
            showNotification(mode === 'login' ? 'Вход выполнен успешно!' : 'Регистрация успешна!', 'success');
            closeModal();
            await loadUser();
            await loadCart();
            await renderApp();
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        showNotification('Ошибка подключения к серверу', 'error');
    }
}

async function handleDeliverySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    if (data.captcha !== window.currentCaptcha) {
        showNotification('Неверный код подтверждения', 'error');
        refreshCaptcha();
        return;
    }
    
    const shippingAddress = {
        street: data.street,
        city: data.city,
        country: data.country,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                shippingAddress,
                userId: AppState.user.id,
                paymentMethod: data.payment,
                items: AppState.cart.map(item => ({
                    productId: item.id,
                    productTitle: item.title,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            })
        });

        if (response.ok) {
            const result = await response.json();
            AppState.cart = [];
            await loadOrders();
            
            showNotification('Заказ успешно оформлен! Номер заказа: ' + 
                (result.order?.id || 'N/A').substring(0, 8).toUpperCase(), 'success');
            closeModal();
            
            currentPage = 'orders';
            await renderApp();
            
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        showNotification('Ошибка оформления заказа', 'error');
    }
}

async function handleHomeClick(e) {
    e.preventDefault();
    currentPage = 'home';
    await renderApp();
}

async function handleCartClick(e) {
    e.preventDefault();
    if (!AppState.user) {
        showNotification('Для просмотра корзины необходимо войти в систему', 'error');
        showAuthModal('login');
        return;
    }
    currentPage = 'cart';
    await renderApp();
}

async function handleOrdersClick(e) {
    e.preventDefault();
    if (!AppState.user) {
        showNotification('Для просмотра заказов необходимо войти в систему', 'error');
        showAuthModal('login');
        return;
    }
    currentPage = 'orders';
    await renderApp();
}

async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            AppState.user = null;
            AppState.cart = [];
            AppState.orders = [];
            currentPage = 'home';
            await renderApp();
            showNotification('Выход выполнен успешно', 'success');
        }
    } catch (error) {
        showNotification('Ошибка выхода', 'error');
    }
}

function toggleAuthMode(e, mode) {
    e.preventDefault();
    showAuthModal(mode);
}

function closeModal() {
    const modalsContainer = document.getElementById('modals');
    modalsContainer.innerHTML = '';
}

function showNotification(message, type = 'info') {
    const notificationsContainer = document.getElementById('notifications');
    
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    notificationsContainer.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

window.handleHomeClick = handleHomeClick;
window.handleCartClick = handleCartClick;
window.handleOrdersClick = handleOrdersClick;
window.handleLogout = handleLogout;
window.showAuthModal = showAuthModal;
window.handleAuthSubmit = handleAuthSubmit;
window.toggleAuthMode = toggleAuthMode;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.showDeliveryModal = showDeliveryModal;
window.handleDeliverySubmit = handleDeliverySubmit;
window.showTermsModal = showTermsModal;
window.refreshCaptcha = refreshCaptcha;
window.handleApplyFilters = handleApplyFilters;
window.handleResetFilters = handleResetFilters;
window.closeModal = closeModal;

document.addEventListener('DOMContentLoaded', initApp);