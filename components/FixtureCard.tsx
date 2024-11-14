import Image from 'next/image';
import { useState } from 'react';
import { Fixture } from '@/app/fixtures/page';

interface FixtureCardProps {
  fixture: Fixture;
  onEdit: (fixture: Fixture) => void;
  onDelete: (id: string) => void;
}

const getFixtureIcon = (type: string) => {
  switch (type) {
    case 'Kitchen Sink':
      return '/fixtures/kitchen-sink.svg';
    case 'Bathroom Sink':
      return '/fixtures/bathroom-sink.svg';
    case 'Toilet':
      return '/fixtures/toilet.svg';
    case 'Shower':
      return '/fixtures/shower.svg';
    case 'Dishwasher':
      return '/fixtures/dishwasher.svg';
    case 'Washing Machine':
      return '/fixtures/washing-machine.svg';
    default:
      return '/fixtures/default.svg';
  }
};

export default function FixtureCard({ fixture, onEdit, onDelete }: FixtureCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white/95 flex items-center justify-center p-4 z-10">
          <div className="text-center">
            <p className="text-gray-800 mb-4">Are you sure you want to delete this fixture?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onDelete(fixture.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 relative flex-shrink-0">
            <Image
              src={getFixtureIcon(fixture.type)}
              alt={fixture.type}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800">{fixture.name}</h3>
            <p className="text-sm text-gray-500">{fixture.type}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(fixture)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit fixture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Delete fixture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{fixture.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 