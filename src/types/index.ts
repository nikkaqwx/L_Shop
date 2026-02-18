export interface User {
	id: string;
	username: string;
	email: string;
	phone: string;
	password: string;
	createdAt: Date;
	cart: CartItem[];
	orders: string[];
}

export interface Product {
	id: string;
	title: string;
	artist: string;
	genre: string;
	year: number;
	price: number;
	description: string;
	category: string;
	inStock: boolean;
	imageUrl: string;
	rating: number;
	label: string;
	condition: 'new'|'used'|'vintage';
	tracks: string[];
}

export interface CartItem {
	productId: string;
	quantity: number;
	addedAt: Date;
}

export interface Order {
	id: string;
	userId: string;
	items: OrderItem[];
	totalAmount: number;
	shippingAddress: ShippingAddress;
	status: 'pending'|'processing'|'shipped'|'delivered';
	createdAt: Date;
}

export interface OrderItem {
	productId: string;
	quantity: number;
	price: number;
}

export interface ShippingAddress {
	street: string;
	city: string;
	country: string;
	zipCode: string;
	phone: string;
	email: string;
}