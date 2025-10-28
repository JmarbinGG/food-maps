function AlertModal({ isOpen, title = 'Notice', message = '', variant = 'default', onClose }) {
  if (!isOpen) return null;
  const color = variant === 'error' ? 'text-red-700 bg-red-50 border-red-200'
               : variant === 'success' ? 'text-green-700 bg-green-50 border-green-200'
               : 'text-blue-700 bg-blue-50 border-blue-200';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className={`mb-3 p-3 rounded border ${color}`}>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <div className="text-sm leading-relaxed">{message}</div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}

try { window.AlertModal = AlertModal; } catch (e) {}
