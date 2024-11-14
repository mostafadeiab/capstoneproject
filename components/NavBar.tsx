'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/water-droplet.svg"
                alt="SUS Logo"
                width={32}
                height={32}
                className="text-primary"
              />
              <span className="ml-2 text-xl font-semibold text-gray-800">SUS</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/" className="nav-link">Home</Link>
              
              {/* About Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsAboutOpen(!isAboutOpen)}
                  className="nav-link"
                >
                  About Us
                </button>
                {isAboutOpen && (
                  <div className="dropdown-menu">
                    <Link href="/mission" className="dropdown-item">Mission</Link>
                    <Link href="/vision" className="dropdown-item">Vision</Link>
                    <Link href="/about" className="dropdown-item">About</Link>
                  </div>
                )}
              </div>

              <Link href="/fixtures" className="nav-link">Fixtures</Link>

              {/* Metrics Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsMetricsOpen(!isMetricsOpen)}
                  className="nav-link"
                >
                  Metrics
                </button>
                {isMetricsOpen && (
                  <div className="dropdown-menu">
                    <Link href="/metrics/forecast" className="dropdown-item">Forecast</Link>
                    <Link href="/metrics/current" className="dropdown-item">Current Use</Link>
                    <Link href="/metrics/abnormalities" className="dropdown-item">Abnormalities</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center"
            >
              <Image
                src="/account-icon.svg"
                alt="Account"
                width={24}
                height={24}
                className="text-gray-600"
              />
            </button>
            {isAccountOpen && (
              <div className="dropdown-menu right-0">
                <Link href="/account" className="dropdown-item">My Account</Link>
                <button onClick={() => {/* handle sign out */}} className="dropdown-item">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 