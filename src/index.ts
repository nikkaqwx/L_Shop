import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app=express();
const PORT=process.env.PORT||3000;

app.use(cors({
	origin: true,
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname,'../frontend')));
app.use('/css',express.static(path.join(__dirname,'../frontend/css')));
app.use('/js',express.static(path.join(__dirname,'../frontend/js')));

app.use('/api/auth',authRoutes);
app.use('/api/products',productRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/orders',orderRoutes);

app.get('*',(_req,res) => {
	res.sendFile(path.join(__dirname,'../frontend/index.html'));
});

app.listen(PORT,() => {
	console.log(`✅ Server is running on http://localhost:${PORT}`);
	console.log(`📦 API available at http://localhost:${PORT}/api`);
	console.log(`🏪 Frontend available at http://localhost:${PORT}`);
});