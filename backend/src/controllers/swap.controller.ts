import { Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Define enums to match Prisma schema
enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

enum SwapRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

// Validation schemas
const createSwapRequestSchema = z.object({
  mySlotId: z.string().min(1, 'Your slot ID is required'),
  theirSlotId: z.string().min(1, 'Requested slot ID is required'),
});

const swapResponseSchema = z.object({
  accept: z.boolean(),
});

/**
 * GET /api/swappable-slots
 * Returns all slots from other users that are marked as SWAPPABLE
 */
export const getSwappableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const swappableSlots = await prisma.event.findMany({
      where: {
        status: EventStatus.SWAPPABLE,
        userId: { not: req.userId }, // Exclude current user's slots
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ slots: swappableSlots });
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/swap-request
 * Create a new swap request
 */
export const createSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Swap request received:', req.body);
    const validatedData = createSwapRequestSchema.parse(req.body);
    const { mySlotId, theirSlotId } = validatedData;
    console.log('Validated data:', validatedData);

    // Verify both slots exist
    const [mySlot, theirSlot] = await Promise.all([
      prisma.event.findUnique({ where: { id: mySlotId } }),
      prisma.event.findUnique({ where: { id: theirSlotId } }),
    ]);

    if (!mySlot) {
      return res.status(404).json({ error: 'Your slot not found' });
    }

    if (!theirSlot) {
      return res.status(404).json({ error: 'Requested slot not found' });
    }

    // Verify mySlot belongs to the current user
    if (mySlot.userId !== req.userId) {
      return res.status(403).json({ error: 'You do not own the slot you are offering' });
    }

    // Verify theirSlot belongs to someone else
    if (theirSlot.userId === req.userId) {
      return res.status(400).json({ error: 'Cannot swap with your own slot' });
    }

    // Verify both slots are SWAPPABLE
    if (mySlot.status !== EventStatus.SWAPPABLE) {
      return res.status(400).json({ 
        error: 'Your slot must be marked as SWAPPABLE to request a swap' 
      });
    }

    if (theirSlot.status !== EventStatus.SWAPPABLE) {
      return res.status(400).json({ 
        error: 'The requested slot is no longer available for swapping' 
      });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the swap request
      const swapRequest = await tx.swapRequest.create({
        data: {
          requesterId: req.userId!,
          ownerId: theirSlot.userId,
          mySlotId,
          theirSlotId,
          status: SwapRequestStatus.PENDING,
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
          mySlot: true,
          theirSlot: true,
        },
      });

      // Update both slots to SWAP_PENDING
      await tx.event.updateMany({
        where: {
          id: { in: [mySlotId, theirSlotId] },
        },
        data: {
          status: EventStatus.SWAP_PENDING,
        },
      });

      return swapRequest;
    });

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/swap-response/:requestId
 * Respond to a swap request (accept or reject)
 */
export const respondToSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const validatedData = swapResponseSchema.parse(req.body);
    const { accept } = validatedData;

    // Find the swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: requestId },
      include: {
        mySlot: true,
        theirSlot: true,
      },
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Verify the current user is the owner of the requested slot
    if (swapRequest.ownerId !== req.userId) {
      return res.status(403).json({ 
        error: 'You are not authorized to respond to this swap request' 
      });
    }

    // Verify the request is still pending
    if (swapRequest.status !== SwapRequestStatus.PENDING) {
      return res.status(400).json({ 
        error: `This swap request has already been ${swapRequest.status.toLowerCase()}` 
      });
    }

    // Use a transaction for atomic updates
    const result = await prisma.$transaction(async (tx: any) => {
      if (accept) {
        // ACCEPT: Exchange the ownership of the two slots
        await tx.event.update({
          where: { id: swapRequest.mySlotId },
          data: { 
            userId: swapRequest.ownerId,
            status: EventStatus.BUSY,
          },
        });

        await tx.event.update({
          where: { id: swapRequest.theirSlotId },
          data: { 
            userId: swapRequest.requesterId,
            status: EventStatus.BUSY,
          },
        });

        // Update swap request status to ACCEPTED
        const updatedRequest = await tx.swapRequest.update({
          where: { id: requestId },
          data: { status: SwapRequestStatus.ACCEPTED },
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            owner: {
              select: { id: true, name: true, email: true },
            },
            mySlot: true,
            theirSlot: true,
          },
        });

        return { accepted: true, swapRequest: updatedRequest };
      } else {
        // REJECT: Set both slots back to SWAPPABLE
        await tx.event.update({
          where: { id: swapRequest.mySlotId },
          data: { status: EventStatus.SWAPPABLE },
        });

        await tx.event.update({
          where: { id: swapRequest.theirSlotId },
          data: { status: EventStatus.SWAPPABLE },
        });

        // Update swap request status to REJECTED
        const updatedRequest = await tx.swapRequest.update({
          where: { id: requestId },
          data: { status: SwapRequestStatus.REJECTED },
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            owner: {
              select: { id: true, name: true, email: true },
            },
            mySlot: true,
            theirSlot: true,
          },
        });

        return { accepted: false, swapRequest: updatedRequest };
      }
    });

    res.json({
      message: result.accepted ? 'Swap request accepted' : 'Swap request rejected',
      swapRequest: result.swapRequest,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Respond to swap request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/swap-requests/incoming
 * Get all incoming swap requests for the current user
 */
export const getIncomingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const incomingRequests = await prisma.swapRequest.findMany({
      where: {
        ownerId: req.userId,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        mySlot: true,
        theirSlot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests: incomingRequests });
  } catch (error) {
    console.error('Get incoming requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/swap-requests/outgoing
 * Get all outgoing swap requests from the current user
 */
export const getOutgoingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const outgoingRequests = await prisma.swapRequest.findMany({
      where: {
        requesterId: req.userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        mySlot: true,
        theirSlot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests: outgoingRequests });
  } catch (error) {
    console.error('Get outgoing requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
