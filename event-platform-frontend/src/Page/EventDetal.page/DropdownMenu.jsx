import { useState, useRef, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

export default function DropdownMenu({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1 rounded hover:bg-gray-200 transition"
      >
        <FiMoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}