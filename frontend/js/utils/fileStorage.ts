import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

export const initializeDataFiles = async (): Promise<void> => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }

    try {
        await fs.access(USERS_FILE);
    } catch {
        await fs.writeFile(USERS_FILE, '[]', 'utf-8');
    }

    try {
        await fs.access(PRODUCTS_FILE);
    } catch {
        const demoProducts = [
            {
                id: '1',
                title: 'The Dark Side of the Moon',
                artist: 'Pink Floyd',
                genre: 'Progressive Rock',
                year: 1973,
                price: 29.99,
                description: 'Классический альбом прогрессивного рока. Великолепное звучание и культовый дизайн конверта.',
                category: 'Rock',
                inStock: true,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.9,
                label: 'Harvest',
                condition: 'vintage',
                tracks: ['Speak to Me', 'Breathe', 'On the Run', 'Time', 'The Great Gig in the Sky', 'Money', 'Us and Them', 'Any Colour You Like', 'Brain Damage', 'Eclipse']
            },
            {
                id: '2',
                title: 'Kind of Blue',
                artist: 'Miles Davis',
                genre: 'Jazz',
                year: 1959,
                price: 24.99,
                description: 'Величайший джазовый альбом всех времен. Модальный джаз в исполнении легендарных музыкантов.',
                category: 'Jazz',
                inStock: true,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.8,
                label: 'Columbia',
                condition: 'new',
                tracks: ['So What', 'Freddie Freeloader', 'Blue in Green', 'All Blues', 'Flamenco Sketches']
            },
            {
                id: '3',
                title: 'Abbey Road',
                artist: 'The Beatles',
                genre: 'Rock',
                year: 1969,
                price: 27.99,
                description: 'Легендарный альбом The Beatles. Знаменитый переход через зебру стал иконой поп-культуры.',
                category: 'Rock',
                inStock: true,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.7,
                label: 'Apple',
                condition: 'used',
                tracks: ['Come Together', 'Something', 'Maxwell\'s Silver Hammer', 'Oh! Darling', 'Octopus\'s Garden', 'I Want You (She\'s So Heavy)', 'Here Comes the Sun', 'Because', 'You Never Give Me Your Money', 'Sun King', 'Mean Mr. Mustard', 'Polythene Pam', 'She Came In Through the Bathroom Window', 'Golden Slumbers', 'Carry That Weight', 'The End', 'Her Majesty']
            },
            {
                id: '4',
                title: 'Thriller',
                artist: 'Michael Jackson',
                genre: 'Pop',
                year: 1982,
                price: 22.99,
                description: 'Самый продаваемый альбом всех времен. Инновационный звук и революционные видеоклипы.',
                category: 'Pop',
                inStock: true,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.9,
                label: 'Epic',
                condition: 'new',
                tracks: ['Wanna Be Startin\' Somethin\'', 'Baby Be Mine', 'The Girl Is Mine', 'Thriller', 'Beat It', 'Billie Jean', 'Human Nature', 'P.Y.T. (Pretty Young Thing)', 'The Lady in My Life']
            },
            {
                id: '5',
                title: 'Back in Black',
                artist: 'AC/DC',
                genre: 'Hard Rock',
                year: 1980,
                price: 26.99,
                description: 'Один из самых продаваемых рок-альбомов в истории. Возвращение группы после смерти Бона Скотта.',
                category: 'Rock',
                inStock: false,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.8,
                label: 'Atlantic',
                condition: 'used',
                tracks: ['Hells Bells', 'Shoot to Thrill', 'What Do You Do for Money Honey', 'Givin the Dog a Bone', 'Let Me Put My Love into You', 'Back in Black', 'You Shook Me All Night Long', 'Have a Drink on Me', 'Shake a Leg', 'Rock and Roll Ain\'t Noise Pollution']
            },
            {
                id: '6',
                title: 'The Wall',
                artist: 'Pink Floyd',
                genre: 'Progressive Rock',
                year: 1979,
                price: 31.99,
                description: 'Концептуальный рок-опера о изоляции и отчуждении. Музыкальный и визуальный шедевр.',
                category: 'Rock',
                inStock: true,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.7,
                label: 'Harvest',
                condition: 'vintage',
                tracks: ['In the Flesh?', 'The Thin Ice', 'Another Brick in the Wall, Part 1', 'The Happiest Days of Our Lives', 'Another Brick in the Wall, Part 2', 'Mother', 'Goodbye Blue Sky', 'Empty Spaces', 'Young Lust', 'One of My Turns', 'Don\'t Leave Me Now', 'Another Brick in the Wall, Part 3', 'Goodbye Cruel World']
            },
            {
                id: '7',
                title: 'Blue',
                artist: 'Joni Mitchell',
                genre: 'Folk',
                year: 1971,
                price: 23.99,
                description: 'Икона фолк-музыки. Искренние тексты и сложные музыкальные аранжировки.',
                category: 'Folk',
                inStock: true,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.9,
                label: 'Reprise',
                condition: 'vintage',
                tracks: ['All I Want', 'My Old Man', 'Little Green', 'Carey', 'Blue', 'California', 'This Flight Tonight', 'River', 'A Case of You', 'The Last Time I Saw Richard']
            },
            {
                id: '8',
                title: 'Led Zeppelin IV',
                artist: 'Led Zeppelin',
                genre: 'Hard Rock',
                year: 1971,
                price: 28.99,
                description: 'Эпический альбом с бессмертными хитами. Включает легендарную "Stairway to Heaven".',
                category: 'Rock',
                inStock: true,
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
                rating: 4.8,
                label: 'Atlantic',
                condition: 'used',
                tracks: ['Black Dog', 'Rock and Roll', 'The Battle of Evermore', 'Stairway to Heaven', 'Misty Mountain Hop', 'Four Sticks', 'Going to California', 'When the Levee Breaks']
            }
        ];
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(demoProducts, null, 2), 'utf-8');
    }

    try {
        await fs.access(ORDERS_FILE);
    } catch {
        await fs.writeFile(ORDERS_FILE, '[]', 'utf-8');
    }
};

export const readUsers = async (): Promise<any[]> => {
    await initializeDataFiles();
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
};


export const writeUsers = async (users: any[]): Promise<void> => {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};


export const readProducts = async (): Promise<any[]> => {
    await initializeDataFiles();
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
};


export const writeProducts = async (products: any[]): Promise<void> => {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
};

export const readOrders = async (): Promise<any[]> => {
    await initializeDataFiles();
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
};

export const writeOrders = async (orders: any[]): Promise<void> => {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
};