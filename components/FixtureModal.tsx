'use client';

import { useState, useEffect } from 'react';
import { Fixture } from '@/app/fixtures/page';

const FIXTURE_TYPES = [
  'Kitchen Sink',
  'Bathroom Sink',
  'Toilet',
  'Shower',
  'Dishwasher',
  'Washing Machine'
];

type NewFixture = {
  name: string;
  type: string;
  location: string;
};

type FixtureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fixture: NewFixture) => void;
  fixture?: Fixture | null;
};

export default function FixtureModal({ isOpen, onClose, onSave, fixture }: FixtureModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');

  // Reset form when modal opens/closes or fixture changes
  useEffect(() => {
    if (fixture) {
      setName(fixture.name);
      setType(fixture.type);
      setLocation(fixture.location);
    } else {
      setName('');
      setType('');
      setLocation('');
    }
  }, [fixture, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, type, location });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {fixture ? 'Edit Fixture' : 'Add New Fixture'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fixture Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a type...</option>
              {FIXTURE_TYPES.map((fixtureType) => (
                <option key={fixtureType} value={fixtureType}>
                  {fixtureType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fixture Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Master Bathroom Sink"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Second Floor"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors"
            >
              Save Fixture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 