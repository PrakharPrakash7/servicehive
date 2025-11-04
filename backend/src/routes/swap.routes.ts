import { Router } from 'express';
import {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getIncomingRequests,
  getOutgoingRequests,
} from '../controllers/swap.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All swap routes require authentication
router.use(authenticate);

router.get('/swappable-slots', getSwappableSlots);
router.post('/swap-request', createSwapRequest);
router.post('/swap-response/:requestId', respondToSwapRequest);
router.get('/swap-requests/incoming', getIncomingRequests);
router.get('/swap-requests/outgoing', getOutgoingRequests);

export default router;
