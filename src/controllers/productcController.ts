import { Request, Response } from 'express';
import { readProducts } from '../utils/fileStorage';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        let products = await readProducts();

        if (req.query.search) {
            const searchTerm = (req.query.search as string).toLowerCase();
            products = products.filter((p: any) => 
                p.title.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.artist.toLowerCase().includes(searchTerm) ||
                p.genre.toLowerCase().includes(searchTerm)
            );
        }

        if (req.query.category && req.query.category !== 'all') {
            products = products.filter((p: any) => p.category === req.query.category);
        }

        if (req.query.genre && req.query.genre !== 'all') {
            products = products.filter((p: any) => p.genre === req.query.genre);
        }

        if (req.query.condition && req.query.condition !== 'all') {
            products = products.filter((p: any) => p.condition === req.query.condition);
        }

        if (req.query.inStock === 'true') {
            products = products.filter((p: any) => p.inStock);
        } else if (req.query.inStock === 'false') {
            products = products.filter((p: any) => !p.inStock);
        }

        if (req.query.minPrice) {
            const minPrice = parseFloat(req.query.minPrice as string);
            products = products.filter((p: any) => p.price >= minPrice);
        }
        
        if (req.query.maxPrice) {
            const maxPrice = parseFloat(req.query.maxPrice as string);
            products = products.filter((p: any) => p.price <= maxPrice);
        }

        if (req.query.minYear) {
            const minYear = parseInt(req.query.minYear as string);
            products = products.filter((p: any) => p.year >= minYear);
        }
        
        if (req.query.maxYear) {
            const maxYear = parseInt(req.query.maxYear as string);
            products = products.filter((p: any) => p.year <= maxYear);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort as string;
            switch (sortBy) {
                case 'price_asc':
                    products.sort((a: any, b: any) => a.price - b.price);
                    break;
                case 'price_desc':
                    products.sort((a: any, b: any) => b.price - a.price);
                    break;
                case 'year_asc':
                    products.sort((a: any, b: any) => a.year - b.year);
                    break;
                case 'year_desc':
                    products.sort((a: any, b: any) => b.year - a.year);
                    break;
                case 'rating_desc':
                    products.sort((a: any, b: any) => b.rating - a.rating);
                    break;
                case 'name_asc':
                    products.sort((a: any, b: any) => a.title.localeCompare(b.title));
                    break;
                case 'name_desc':
                    products.sort((a: any, b: any) => b.title.localeCompare(a.title));
                    break;
            }
        }
        
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Ошибка получения товаров' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const products = await readProducts();
        const product = products.find((p: any) => p.id === id);
        
        if (!product) {
            res.status(404).json({ error: 'Товар не найден' });
            return;
        }
        
        res.json(product);
    } catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({ error: 'Ошибка получения товара' });
    }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await readProducts();
        const categories = [...new Set(products.map((p: any) => p.category))];
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Ошибка получения категорий' });
    }
};

export const getGenres = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await readProducts();
        const genres = [...new Set(products.map((p: any) => p.genre))];
        res.json(genres);
    } catch (error) {
        console.error('Get genres error:', error);
        res.status(500).json({ error: 'Ошибка получения жанров' });
    }
};

export const getConditions = async (_req: Request, res: Response): Promise<void> => {
    try {
        const conditions = ['new', 'used', 'vintage'];
        res.json(conditions);
    } catch (error) {
        console.error('Get conditions error:', error);
        res.status(500).json({ error: 'Ошибка получения состояний' });
    }
};

export const getFilterOptions = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await readProducts();

        const prices = products.map((p: any) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const years = products.map((p: any) => p.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        
        const categories = [...new Set(products.map((p: any) => p.category))];

        const genres = [...new Set(products.map((p: any) => p.genre))];

        const conditions = ['new', 'used', 'vintage'];
        
        res.json({
            priceRange: { min: minPrice, max: maxPrice },
            yearRange: { min: minYear, max: maxYear },
            categories,
            genres,
            conditions
        });
    } catch (error) {
        console.error('Get filter options error:', error);
        res.status(500).json({ error: 'Ошибка получения опций фильтрации' });
    }
};