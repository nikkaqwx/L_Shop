import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readUsers, writeUsers, readProducts, readOrders, writeOrders } from '../utils/fileStorage';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shippingAddress, userId, paymentMethod } = req.body;
        
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
        
        if (user.cart.length === 0) {
            res.status(400).json({ error: 'Корзина пуста' });
            return;
        }
        
        const products = await readProducts();
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        
        if (userIndex === -1) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return;
        }
        
        let totalAmount = 0;
        const orderItems: any[] = [];
        
        for (const cartItem of user.cart) {
            const product = products.find((p: any) => p.id === cartItem.productId);
            if (product) {
                const itemTotal = product.price * cartItem.quantity;
                totalAmount += itemTotal;
                orderItems.push({
                    productId: cartItem.productId,
                    quantity: cartItem.quantity,
                    price: product.price,
                    productTitle: product.title,
                    productArtist: product.artist
                });
            }
        }
        
        const shippingCost = totalAmount > 50 ? 0 : 5.99;
        totalAmount += shippingCost;
        
        const newOrder = {
            id: uuidv4(),
            userId: user.id,
            items: orderItems,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod || 'card',
            status: 'pending' as 'pending' | 'processing' | 'shipped' | 'delivered',
            createdAt: new Date(),
            shippingCost: shippingCost
        };
        
        const orders = await readOrders();
        orders.push(newOrder);
        await writeOrders(orders);
        
        users[userIndex].cart = [];
        await writeUsers(users);
        
        res.status(201).json({
            message: 'Заказ успешно оформлен',
            order: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Ошибка создания заказа' });
    }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.query;
        
        if (!userId || typeof userId !== 'string') {
            res.status(401).json({ error: 'Требуется аутентификация' });
            return;
        }
        
        const orders = await readOrders();
        const userOrders = orders.filter((order: any) => order.userId === userId);
        
        userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        res.json(userOrders);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
};