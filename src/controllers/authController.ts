import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readUsers, writeUsers } from '../utils/fileStorage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, phone, password } = req.body;
        
        if (!username || !email || !phone || !password) {
            res.status(400).json({ error: 'Все поля обязательны' });
            return;
        }

        const users = await readUsers();
        
        if (users.find((u: any) => u.email === email)) {
            res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            return;
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            id: uuidv4(),
            username,
            email,
            phone,
            password: hashedPassword,
            createdAt: new Date(),
            cart: [],
            orders: []
        };
        
        users.push(newUser);
        await writeUsers(users);
        
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '10m' }
        );
        
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000,
            sameSite: 'lax'
        });
        
        res.status(201).json({
            message: 'Регистрация успешна',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Ошибка регистрации' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            res.status(400).json({ error: 'Email и пароль обязательны' });
            return;
        }
        
        const users = await readUsers();
        const user = users.find((u: any) => u.email === email);
        
        if (!user) {
            res.status(401).json({ error: 'Пользователь не найден' });
            return;
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Неверный пароль' });
            return;
        }
        
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '10m' }
        );
        
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000,
            sameSite: 'lax'
        });
        
        res.json({
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка входа' });
    }
};

export const logout = (_req: Request, res: Response): void => {
    try {
        res.clearCookie('auth_token');
        res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Ошибка выхода' });
    }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.auth_token;
        
        if (!token) {
            res.status(401).json({ error: 'Не авторизован' });
            return;
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const users = await readUsers();
        const user = users.find((u: any) => u.id === decoded.userId);
        
        if (!user) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return;
        }
        
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone
        });
    } catch (error) {
        res.status(401).json({ error: 'Неверный токен' });
    }
};