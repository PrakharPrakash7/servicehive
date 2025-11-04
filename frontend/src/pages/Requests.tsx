import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/api';
import { SwapRequest, SwapRequestStatus } from '../types';

const Requests: React.FC = () => {
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [incomingResponse, outgoingResponse] = await Promise.all([
        api.get('/swap-requests/incoming'),
        api.get('/swap-requests/outgoing'),
      ]);
      setIncomingRequests(incomingResponse.data.requests);
      setOutgoingRequests(outgoingResponse.data.requests);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load requests');
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      await api.post(`/swap-response/${requestId}`, { accept });
      alert(accept ? 'Swap accepted successfully!' : 'Swap rejected');
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to respond to request');
    }
  };

  const getStatusBadgeColor = (status: SwapRequestStatus) => {
    switch (status) {
      case SwapRequestStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case SwapRequestStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case SwapRequestStatus.REJECTED:
        return 'bg-red-100 text-red-800';
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
      <h1 className="text-3xl font-bold mb-8">Swap Requests</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'incoming'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Incoming ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'outgoing'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Outgoing ({outgoingRequests.length})
        </button>
      </div>

      {/* Incoming Requests */}
      {activeTab === 'incoming' && (
        <div>
          {incomingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No incoming swap requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white shadow rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Swap Request from {request.requester.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(request.createdAt), 'PPp')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="border border-gray-200 rounded p-4 bg-red-50">
                      <h4 className="font-semibold text-red-900 mb-2">Your Slot</h4>
                      <p className="font-medium">{request.theirSlot.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.theirSlot.startTime), 'PPp')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.theirSlot.endTime), 'PPp')}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded p-4 bg-green-50">
                      <h4 className="font-semibold text-green-900 mb-2">Their Slot</h4>
                      <p className="font-medium">{request.mySlot.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.mySlot.startTime), 'PPp')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.mySlot.endTime), 'PPp')}
                      </p>
                    </div>
                  </div>

                  {request.status === SwapRequestStatus.PENDING && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRespondToRequest(request.id, true)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondToRequest(request.id, false)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Outgoing Requests */}
      {activeTab === 'outgoing' && (
        <div>
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No outgoing swap requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outgoingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white shadow rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Swap Request to {request.owner.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(request.createdAt), 'PPp')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded p-4 bg-blue-50">
                      <h4 className="font-semibold text-blue-900 mb-2">Your Slot</h4>
                      <p className="font-medium">{request.mySlot.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.mySlot.startTime), 'PPp')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.mySlot.endTime), 'PPp')}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded p-4 bg-purple-50">
                      <h4 className="font-semibold text-purple-900 mb-2">Their Slot</h4>
                      <p className="font-medium">{request.theirSlot.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.theirSlot.startTime), 'PPp')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.theirSlot.endTime), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Requests;
