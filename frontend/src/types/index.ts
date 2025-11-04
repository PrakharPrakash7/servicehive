export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING',
}

export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export enum SwapRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  ownerId: string;
  mySlotId: string;
  theirSlotId: string;
  status: SwapRequestStatus;
  createdAt: string;
  updatedAt: string;
  requester: User;
  owner: User;
  mySlot: Event;
  theirSlot: Event;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: any;
}
