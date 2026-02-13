import { ApiService } from '../utils/ApiService';

export class ProductCard {
    constructor(private product: any) {}

render(): string {
    return `
        <div class="product-card" data-product-id="${this.product.id}">
            <div class="product-image">
                <img src="${this.product.imageUrl || '/images/default.jpg'}" alt="${this.product.title}">
                ${!this.product.inStock ? '<span class="out-of-stock">Нет в наличии</span>' : ''}
            </div>
            
            <div class="product-info">
                <h3 class="product-title" data-title>${this.product.title}</h3>  <!-- ДОБАВЛЕНО -->
                <p class="product-artist">${this.product.artist}</p>
                <p class="product-genre">${this.product.genre} • ${this.product.year}</p>
                
                <div class="product-meta">
                    <span class="product-condition ${this.product.condition}">
                        ${this.getConditionText(this.product.condition)}
                    </span>
                    <span class="product-rating">
                        <i class="fas fa-star"></i> ${this.product.rating}
                    </span>
                </div>
                
                <p class="product-description">${this.product.description}</p>
                
                <div class="product-footer">
                    <div class="product-price" data-price>$${this.product.price.toFixed(2)}</div>  <!-- ДОБАВЛЕНО -->
                    <button class="btn btn-primary add-to-cart" 
                            data-product-id="${this.product.id}"
                            ${!this.product.inStock ? 'disabled' : ''}>
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
}