import { Router } from 'express';
import {
    getAllProducts,
    getProductById,
    getCategories,
    getGenres,
    getConditions,
    getFilterOptions
} from '../controllers/productcController';

const router = Router();

router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/genres', getGenres);
router.get('/conditions', getConditions);
router.get('/filter-options', getFilterOptions);
router.get('/:id', getProductById);

export default router;