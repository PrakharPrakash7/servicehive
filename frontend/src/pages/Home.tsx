import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to SlotSwapper
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The peer-to-peer time-slot scheduling application
          </p>
          {!isAuthenticated && (
            <div className="flex justify-center space-x-4">
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
              >
                Sign In
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-indigo-600 text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-3">Manage Your Calendar</h3>
            <p className="text-gray-600">
              Create and organize your busy slots. Mark events as swappable when you need flexibility.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-indigo-600 text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-3">Request Swaps</h3>
            <p className="text-gray-600">
              Browse available slots from other users and propose swaps that work for everyone.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-indigo-600 text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-3">Accept or Reject</h3>
            <p className="text-gray-600">
              Review incoming requests and decide which swaps work best for your schedule.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Create Your Events</h4>
                <p className="text-gray-600">
                  Add your scheduled events with start and end times. Mark them as "Busy" initially.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Make Slots Swappable</h4>
                <p className="text-gray-600">
                  When you want flexibility, mark your events as "Swappable" to let others see them.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Browse & Request</h4>
                <p className="text-gray-600">
                  Visit the marketplace to see available slots from others. Request a swap by offering one of your swappable slots.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Accept or Reject</h4>
                <p className="text-gray-600">
                  Review incoming requests and accept the ones that work for you. The swap happens automatically!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
