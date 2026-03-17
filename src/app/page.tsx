export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Stellar Auction House
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Real-time auction platform built on Stellar Soroban
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Live Auctions
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Browse active auctions and place your bids in real-time
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Instant Updates
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Watch bids update in real-time through blockchain events
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Secure Transactions
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              All transactions recorded securely on the Stellar blockchain
            </p>
          </div>
        </div>

        <div className="mt-12">
          <a
            href="/auctions"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            View Active Auctions
          </a>
        </div>
      </div>
    </div>
  );
}
