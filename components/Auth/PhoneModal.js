function PhoneModal({ isOpen, onClose, onSubmit, initialPhone }) {
  const [phone, setPhone] = React.useState(initialPhone || '');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Phone Number Required</h3>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => onSubmit(phone)} className="btn-primary flex-1">Save</button>
        </div>
      </div>
    </div>
  );
}