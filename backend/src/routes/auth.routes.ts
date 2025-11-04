import { Router } from 'express';
import { signUp, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;
