export class Router {
    private currentRoute: string = '/';

    init(): void {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const link = target.closest('[data-route]');
            
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route) {
                    this.navigate(route);
                }
            }
        });

        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname, false);
        });

        this.navigate(window.location.pathname || '/', false);
    }

    navigate(path: string, pushState: boolean = true): void {
        this.currentRoute = path;
        
        if (pushState) {
            window.history.pushState({}, '', path);
        }
        
        this.renderRoute(path);
    }

    private async renderRoute(path: string): Promise<void> {
        const app = document.getElementById('app');
        if (!app) return;

        try {
            let content = '';
            
            if (path === '/') {
                const { HomePage } = await import('../pages/HomePage');
                const homePage = new HomePage();
                content = await homePage.render();
            } else if (path === '/cart') {
                content = '<h1>Корзина (в разработке)</h1>';
            } else if (path === '/checkout') {
                content = '<h1>Оформление заказа (в разработке)</h1>';
            } else {
                content = '<h1>404 - Страница не найдена</h1>';
            }
            
            app.innerHTML = this.getLayout() + content + '</main>';
            
        } catch (error) {
            console.error('Error rendering route:', error);
            app.innerHTML = '<h1>Ошибка загрузки страницы</h1>';
        }
    }

    private getLayout(): string {
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="/" class="logo" data-route="/">
                        <i class="fas fa-record-vinyl"></i>
                        VinylShop
                    </a>
                    <div class="nav-links">
                        <a href="/" class="nav-link" data-route="/">Главная</a>
                        <a href="/cart" class="nav-link" data-route="/cart">Корзина</a>
                        <button id="auth-btn" class="btn btn-outline">Войти</button>
                    </div>
                </div>
            </nav>
            <main class="main-content">
        `;
    }
}