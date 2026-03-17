'use client';

import React from 'react';

export default function CreateAuctionPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Create New Auction
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Auction Details
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your wallet to create a new auction.
          </p>

          <form className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter item description"
              ></textarea>
            </div>

            <div>
              <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Starting Price (XLM)
              </label>
              <input
                type="number"
                id="startingPrice"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Auction End Time
              </label>
              <input
                type="datetime-local"
                id="endTime"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="pt-4">
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Create Auction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}