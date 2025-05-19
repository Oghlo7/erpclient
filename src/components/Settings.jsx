import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Settings() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Outlet />
    </div>
  );
}