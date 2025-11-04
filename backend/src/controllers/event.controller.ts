import { Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Define EventStatus enum to match Prisma schema
enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  status: z.nativeEnum(EventStatus).optional(),
}).refine(
  (data) => {
    const start = new Date(data.startTime as string);
    const end = new Date(data.endTime as string);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
  },
  { message: 'End time must be after start time and dates must be valid', path: ['endTime'] }
);

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().min(1).optional(),
  status: z.nativeEnum(EventStatus).optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(EventStatus),
});

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Received event data:', req.body);
    const validatedData = createEventSchema.parse(req.body);
    const { title, startTime, endTime, status } = validatedData;

    const startDate = new Date(startTime as string);
    const endDate = new Date(endTime as string);
    console.log('Parsed dates - Start:', startDate, 'End:', endDate);

    const event = await prisma.event.create({
      data: {
        title,
        startTime: startDate,
        endTime: endDate,
        status: status || EventStatus.BUSY,
        userId: req.userId!,
      },
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.userId },
      orderBy: { startTime: 'asc' },
    });

    res.json({ events });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only allow users to view their own events
    if (event.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateEventSchema.parse(req.body);

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if event is in SWAP_PENDING status
    if (existingEvent.status === EventStatus.SWAP_PENDING) {
      return res.status(400).json({ 
        error: 'Cannot update event with pending swap request' 
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.startTime) updateData.startTime = new Date(validatedData.startTime as string);
    if (validatedData.endTime) updateData.endTime = new Date(validatedData.endTime as string);
    if (validatedData.status) updateData.status = validatedData.status;

    // Validate time range if both times are being updated
    if (updateData.startTime && updateData.endTime) {
      if (updateData.endTime <= updateData.startTime) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if event is in SWAP_PENDING status
    if (existingEvent.status === EventStatus.SWAP_PENDING) {
      return res.status(400).json({ 
        error: 'Cannot delete event with pending swap request' 
      });
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEventStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStatusSchema.parse(req.body);

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if event is in SWAP_PENDING status
    if (existingEvent.status === EventStatus.SWAP_PENDING) {
      return res.status(400).json({ 
        error: 'Cannot update status of event with pending swap request' 
      });
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status: validatedData.status },
    });

    res.json({
      message: 'Event status updated successfully',
      event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update event status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
