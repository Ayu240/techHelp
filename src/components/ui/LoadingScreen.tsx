import { CircleDashed } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="flex flex-col items-center">
        <CircleDashed className="w-12 h-12 text-blue-500 animate-spin" />
        <h2 className="mt-4 text-xl font-medium text-gray-700">Loading...</h2>
      </div>
    </div>
  );
}