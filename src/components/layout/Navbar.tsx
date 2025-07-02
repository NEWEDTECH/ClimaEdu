"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileSelect } from '@/components/profile';
import { IoMdMenu } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { FiHome, FiHeart, FiUsers } from "react-icons/fi";
import { useProfile } from '@/context/zustand/useProfile';


export function Navbar() {

  const { infoInstitutions } = useProfile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between bg-gray-50 dark:bg-gray-950 shadow-sm">

      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold">
          {infoInstitutions?.institutions?.urlImage ? (
            <img
            className='py-4 h-18 w-auto'
              src={infoInstitutions.institutions.urlImage}
              alt="Logo da instituição"
            />
          ) : (
            <span className="text-gray-800 dark:text-white">ClimaEdu</span>
          )}
        </Link>
      </div>

      {/* Navigation buttons - Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <FiHome className="w-5 h-5" />
          <span className="text-base font-medium">Início</span>
        </Link>
        
        <button 
          className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors cursor-not-allowed opacity-50"
          disabled
        >
          <FiHeart className="w-5 h-5" />
          <span className="text-base font-medium">Favoritos</span>
        </button>
        
        <Link 
          href="/social" 
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <FiUsers className="w-5 h-5" />
          <span className="text-base font-medium">Comunidade</span>
        </Link>
      </div>

      <div className='flex items-center justify-end'>

        <div className="hidden md:flex items-center gap-4">
          <ProfileSelect
            onLogout={() => console.log('Logout clicked')}
          />
        </div>

      </div>

      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <IoCloseSharp size={30} />
          ) : (
            <IoMdMenu size={30} />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 h-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg z-50">
          <div className="px-4 py-2">
            {/* Navigation buttons - Mobile */}
            <div className="space-y-2 mb-4">
              <Link 
                href="/" 
                className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                <span className="text-base font-medium">Início</span>
              </Link>
              
              <button 
                className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left opacity-50"
                disabled
              >
                <FiHeart className="w-5 h-5" />
                <span className="text-base font-medium">Favoritos</span>
              </button>
              
              <Link 
                href="/social" 
                className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiUsers className="w-5 h-5" />
                <span className="text-base font-medium">Comunidade</span>
              </Link>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <ProfileSelect
                onLogout={() => console.log('Logout clicked')}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
