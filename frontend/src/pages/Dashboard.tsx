import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/api';
import { Event, EventStatus } from '../types';

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.events);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load events');
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', { title, startTime, endTime, status: EventStatus.BUSY });
      setShowModal(false);
      setTitle(''); setStartTime(''); setEndTime('');
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event');
    }
  };

  const handleUpdateStatus = async (eventId: string, status: EventStatus) => {
    try {
      await api.put(`/events/${eventId}`, { status });
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update event status');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };

  const getStatusColor = (status: EventStatus) => {
    return status === EventStatus.BUSY ? 'bg-gray-100 text-gray-800' :
           status === EventStatus.SWAPPABLE ? 'bg-green-100 text-green-800' :
           'bg-yellow-100 text-yellow-800';
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md">+ Create Event</button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-500">No events yet!</p></div>
      ) : (
        <div className="grid gap-4">{events.map(event => (
          <div key={event.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600">Start: {format(new Date(event.startTime), 'PPpp')}</p>
                <p className="text-gray-600">End: {format(new Date(event.endTime), 'PPpp')}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm mt-3 ${getStatusColor(event.status)}`}>
                  {event.status.replace('_', ' ')}
                </span>
              </div>
              <div className="ml-4 space-y-2">
                {event.status === EventStatus.BUSY && (
                  <button onClick={() => handleUpdateStatus(event.id, EventStatus.SWAPPABLE)} className="block w-full bg-green-600 text-white px-4 py-2 rounded text-sm">Make Swappable</button>
                )}
                {event.status === EventStatus.SWAPPABLE && (
                  <button onClick={() => handleUpdateStatus(event.id, EventStatus.BUSY)} className="block w-full bg-gray-600 text-white px-4 py-2 rounded text-sm">Mark as Busy</button>
                )}
                {event.status !== EventStatus.SWAP_PENDING && (
                  <button onClick={() => handleDeleteEvent(event.id)} className="block w-full bg-red-600 text-white px-4 py-2 rounded text-sm">Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}</div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-1">Start Time</label><input type="datetime-local" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-1">End Time</label><input type="datetime-local" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setTitle(''); setStartTime(''); setEndTime(''); }} className="flex-1 bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;