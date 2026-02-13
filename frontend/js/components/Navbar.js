export class Navbar {
    private isLoggedIn: boolean = false;
    
    constructor(isLoggedIn: boolean) {
        this.isLoggedIn = isLoggedIn;
    }
    
    render(): string {
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="/" class="logo" data-route="/">
                        <i class="fas fa-record-vinyl"></i>
                        VinylShop
                    </a>
                    
                    <div class="nav-links">
                        <a href="/" class="nav-link" data-route="/">
                            <i class="fas fa-home"></i> Главная
                        </a>
                        
                        ${this.isLoggedIn ? `
                            <a href="/cart" class="nav-link" data-route="/cart">
                                <i class="fas fa-shopping-cart"></i> Корзина
                                <span id="cart-count" class="cart-count">0</span>
                            </a>
                            <a href="/orders" class="nav-link" data-route="/orders">
                                <i class="fas fa-box"></i> Заказы
                            </a>
                            <button id="logout-btn" class="btn btn-outline">
                                <i class="fas fa-sign-out-alt"></i> Выйти
                            </button>
                        ` : `
                            <button id="login-btn" class="btn btn-outline">
                                <i class="fas fa-sign-in-alt"></i> Войти
                            </button>
                            <button id="register-btn" class="btn btn-primary">
                                <i class="fas fa-user-plus"></i> Регистрация
                            </button>
                        `}
                    </div>
                </div>
            </nav>
        `;
    }
}