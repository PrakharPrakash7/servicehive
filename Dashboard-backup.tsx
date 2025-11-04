import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/api';
import { Event, EventStatus } from '../types';

const Dashboard: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<Event[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsResponse, myEventsResponse] = await Promise.all([
        api.get('/swappable-slots'),
        api.get('/events'),
      ]);
      
      setAvailableSlots(slotsResponse.data.slots);
      setMySwappableSlots(
        myEventsResponse.data.events.filter(
          (event: Event) => event.status === EventStatus.SWAPPABLE
        )
      );
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot: Event) => {
    if (mySwappableSlots.length === 0) {
      alert('You need to have at least one swappable slot to request a swap');
      return;
    }
    setSelectedSlot(slot);
    setShowSwapModal(true);
  };

  const handleConfirmSwap = async (mySlotId: string) => {
    if (!selectedSlot) return;

    try {
      await api.post('/swap-request', {
        mySlotId,
        theirSlotId: selectedSlot.id,
      });
      alert('Swap request sent successfully!');
      setShowSwapModal(false);
      setSelectedSlot(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send swap request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {availableSlots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No swappable slots available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-3">{slot.title}</h3>
              <div className="text-gray-600 space-y-2 mb-4">
                <p>
                  <span className="font-medium">Start:</span>{' '}
                  {format(new Date(slot.startTime), 'PPp')}
                </p>
                <p>
                  <span className="font-medium">End:</span>{' '}
                  {format(new Date(slot.endTime), 'PPp')}
                </p>
                <p>
                  <span className="font-medium">Owner:</span> {slot.user?.name}
                </p>
              </div>
              <button
                onClick={() => handleRequestSwap(slot)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Request Swap
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Select Your Slot to Swap</h2>
            <div className="bg-gray-50 p-4 rounded mb-6">
              <h3 className="font-semibold mb-2">Requesting:</h3>
              <p className="text-gray-700">{selectedSlot.title}</p>
              <p className="text-sm text-gray-600">
                {format(new Date(selectedSlot.startTime), 'PPp')} -{' '}
                {format(new Date(selectedSlot.endTime), 'p')}
              </p>
            </div>

            <h3 className="font-semibold mb-3">Your Swappable Slots:</h3>
            {mySwappableSlots.length === 0 ? (
              <p className="text-gray-500 mb-6">
                You don't have any swappable slots. Please mark a slot as swappable first.
              </p>
            ) : (
              <div className="space-y-3 mb-6">
                {mySwappableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="border border-gray-200 rounded p-4 hover:border-indigo-500 cursor-pointer transition"
                    onClick={() => handleConfirmSwap(slot.id)}
                  >
                    <h4 className="font-semibold">{slot.title}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(slot.startTime), 'PPp')} -{' '}
                      {format(new Date(slot.endTime), 'p')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowSwapModal(false);
                setSelectedSlot(null);
              }}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

