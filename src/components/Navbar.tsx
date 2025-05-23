import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <h1 className="text-xl font-bold">
            Smart Video Learning Progress Tracker
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 