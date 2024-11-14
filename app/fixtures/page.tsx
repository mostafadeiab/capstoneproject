'use client';

import { useState, useEffect } from 'react';
import NavBar from "@/components/NavBar";
import FixtureModal from "@/components/FixtureModal";
import FixtureCard from "@/components/FixtureCard";

export type Fixture = {
  id: string;
  name: string;
  type: string;
  location: string;
};

type NewFixture = Omit<Fixture, 'id'>;

export default function Fixtures() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);

  // Load fixtures from localStorage on mount
  useEffect(() => {
    const savedFixtures = localStorage.getItem('fixtures');
    if (savedFixtures) {
      setFixtures(JSON.parse(savedFixtures));
    }
  }, []);

  // Save fixtures to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fixtures', JSON.stringify(fixtures));
  }, [fixtures]);

  const handleAddFixture = (fixture: NewFixture) => {
    const newFixture = { ...fixture, id: Date.now().toString() };
    setFixtures([...fixtures, newFixture]);
    setIsModalOpen(false);
  };

  const handleEditFixture = (fixture: NewFixture) => {
    if (!editingFixture) return;
    
    const updatedFixture = { ...fixture, id: editingFixture.id };
    setFixtures(fixtures.map(f => 
      f.id === editingFixture.id ? updatedFixture : f
    ));
    setEditingFixture(null);
    setIsModalOpen(false);
  };

  const handleDeleteFixture = (id: string) => {
    setFixtures(fixtures.filter(f => f.id !== id));
  };

  const openEditModal = (fixture: Fixture) => {
    setEditingFixture(fixture);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Your Fixtures</h1>
        
        {/* Instructions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Manage Your Fixtures</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">1</div>
              <p className="text-gray-600">Click the &quot;Add Fixture&quot; button to open the fixture form.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">2</div>
              <p className="text-gray-600">Select the fixture type from the dropdown (Kitchen Sink, Bathroom Sink, Toilet, Shower, Dishwasher, or Washing Machine).</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">3</div>
              <p className="text-gray-600">Enter a unique name for your fixture and specify its location in your home.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">4</div>
              <p className="text-gray-600">Click &quot;Save&quot; to add the fixture to your dashboard. You can add as many fixtures as needed.</p>
            </div>
          </div>
        </div>

        {/* Add Fixture Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg transition-colors mb-8 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Fixture
        </button>

        {/* Fixtures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixtures.map((fixture) => (
            <FixtureCard 
              key={fixture.id} 
              fixture={fixture}
              onEdit={openEditModal}
              onDelete={handleDeleteFixture}
            />
          ))}
        </div>

        {/* Modal */}
        <FixtureModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingFixture(null);
          }}
          onSave={editingFixture ? handleEditFixture : handleAddFixture}
          fixture={editingFixture}
        />
      </main>
    </div>
  );
} 