export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3366] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-[#2c2d5a]">Loading...</h2>
        <p className="text-gray-500 mt-2">Please wait while we prepare your content.</p>
      </div>
    </div>
  );
} 