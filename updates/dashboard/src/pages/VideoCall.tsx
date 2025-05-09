import { Video } from 'lucide-react';

function VideoCall() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex items-center justify-center mb-6">
          <Video className="h-20 w-20 text-purple-500" />
        </div>
        <button
          className="px-8 py-3 rounded-lg bg-purple-400 text-white font-semibold text-lg opacity-60 cursor-not-allowed"
          disabled
        >
          Start Call
        </button>
      </div>
    </div>
  );
}

export default VideoCall;