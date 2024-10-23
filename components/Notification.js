export default function Notification({ message, type = 'success' }) {
    if (!message) return null;
  
    return (
      <div className={`
        fixed bottom-20 left-1/2 -translate-x-1/2 
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
        text-white px-6 py-3 rounded-lg shadow-lg 
        transform transition-all duration-300 ease-in-out
        animate-bounce
      `}>
        {message}
      </div>
    );
  }