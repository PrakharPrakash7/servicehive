import { Router } from 'express';
import {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All event routes require authentication
router.use(authenticate);

router.post('/', createEvent);
router.get('/', getUserEvents);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.patch('/:id/status', updateEventStatus);

export default router;
