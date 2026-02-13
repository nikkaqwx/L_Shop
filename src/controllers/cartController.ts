import { Request, Response } from 'express';
import { readUsers, writeUsers, readProducts } from '../utils/fileStorage';

export const getCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            res.status(401).json({ error: 'Требуется аутентификация' });
            return;
        }
        
        const users = await readUsers();
        const user = users.find((u: any) => u.id === userId);
        
        if (!user) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return;
        }
        
        const products = await readProducts();
        const cartItems = user.cart.map((cartItem: any) => {
            const product = products.find((p: any) => p.id === cartItem.productId);
            return product ? {
                ...product,
                quantity: cartItem.quantity,
                addedAt: cartItem.addedAt
            } : null;
        }).filter(Boolean);
        
        res.json(cartItems);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Ошибка получения корзины' });
    }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId, quantity, userId } = req.body;
        
        if (!userId) {
            res.status(401).json({ error: 'Требуется аутентификация' });
            return;
        }
        
        if (!productId || !quantity) {
            res.status(400).json({ error: 'Требуется productId и quantity' });
            return;
        }
        
        const users = await readUsers();
        const userIndex = users.findIndex((u: any) => u.id === userId);
        
        if (userIndex === -1) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return;
        }
        
        const existingItemIndex = users[userIndex].cart.findIndex(
            (item: any) => item.productId === productId
        );
        
        if (existingItemIndex !== -1) {
            users[userIndex].cart[existingItemIndex].quantity += quantity;
        } else {
            const newItem = {
                productId,
                quantity,
                addedAt: new Date()
            };
            users[userIndex].cart.push(newItem);
        }
        
        await writeUsers(users);
        res.json({ message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Ошибка добавления в корзину' });
    }
};

export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const { quantity, userId } = req.body;
        
        if (!userId) {
            res.status(401).json({ error: 'Требуется аутентификация' });
            return;
        }
        
        if (quantity < 1) {
            res.status(400).json({ error: 'Количество должно быть не менее 1' });
            return;
        }
        
        const users = await readUsers();
        const userIndex = users.findIndex((u: any) => u.id === userId);
        
        if (userIndex === -1) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return;
        }
        
        const itemIndex = users[userIndex].cart.findIndex(
            (item: any) => item.productId === productId
        );
        
        if (itemIndex === -1) {
            res.status(404).json({ error: 'Товар не найден в корзине' });
            return;
        }
        
        users[userIndex].cart[itemIndex].quantity = quantity;
        await writeUsers(users);
        
        res.json({ message: 'Корзина обновлена' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Ошибка обновления корзины' });
    }
};

export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            res.status(401).json({ error: 'Требуется аутентификация' });
            return;
        }
        
        const users = await readUsers();
        const userIndex = users.findIndex((u: any) => u.id === userId);
        
        if (userIndex === -1) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return;
        }
        
        users[userIndex].cart = users[userIndex].cart.filter(
            (item: any) => item.productId !== productId
        );
        
        await writeUsers(users);
        res.json({ message: 'Товар удален из корзины' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Ошибка удаления из корзины' });
    }
};