export class ApiService {
    private baseUrl: string = 'http://localhost:3000/api';

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async register(data: {
        username: string;
        email: string;
        phone: string;
        password: string;
    }): Promise<any> {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async login(email: string, password: string): Promise<any> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout(): Promise<void> {
        await this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async getCurrentUser(): Promise<any> {
        try {
            return await this.request('/auth/me');
        } catch {
            return null;
        }
    }

    async getProducts(params?: Record<string, string>): Promise<any[]> {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/products${query}`);
    }

    async getProduct(id: string): Promise<any> {
        return this.request(`/products/${id}`);
    }

    async getCategories(): Promise<string[]> {
        return this.request('/products/categories');
    }

    async getGenres(): Promise<string[]> {
        return this.request('/products/genres');
    }

    async getCart(): Promise<any[]> {
        return this.request('/cart');
    }

    async addToCart(productId: string, quantity: number): Promise<any> {
        return this.request('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity, userId: 'temp' })
        });
    }

    async updateCartItem(productId: string, quantity: number): Promise<any> {
        return this.request(`/cart/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity, userId: 'temp' })
        });
    }

    async removeFromCart(productId: string): Promise<any> {
        return this.request(`/cart/${productId}`, {
            method: 'DELETE',
            body: JSON.stringify({ userId: 'temp' })
        });
    }

    async createOrder(shippingAddress: any): Promise<any> {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify({ shippingAddress, userId: 'temp' })
        });
    }

    async getOrders(): Promise<any[]> {
        return this.request('/orders?userId=temp');
    }
}