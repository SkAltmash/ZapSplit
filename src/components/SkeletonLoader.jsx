import React from 'react'

function SkeletonLoader() {
  return (
    <div className="flex h-[calc(100vh-3rem)] mt-12 md:pt-4 bg-gray-100 dark:bg-[#0f0f0f] animate-pulse">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-1/3 max-w-xs bg-white dark:bg-[#1a1a1a] border-r">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 p-3">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-[#222] rounded"
            >
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="w-1/2 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#121212] shadow-sm border-b">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="w-40 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f9f9f9] dark:bg-[#181818]">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 w-40 h-6 rounded-xl"></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white dark:bg-[#121212] border-t">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}


export default SkeletonLoader