'use client';

import React from 'react';
import { useErrorHandler } from '@/context/ErrorContext';
import { AuctionErrorHandler } from '@/utils/errors';

export default function GlobalErrorDisplay() {
  const { errors, removeError } = useErrorHandler();

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {errors.map((error, index) => (
        <div
          key={index}
          className="relative max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            {AuctionErrorHandler.getUserFriendlyMessage(error)}
          </span>

          <button
            onClick={() => removeError(index)}
            className="absolute top-0 right-0 px-2 py-1 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}