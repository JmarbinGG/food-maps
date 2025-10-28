function PhoneModal({ isOpen, onClose, onSubmit, initialPhone }) {
  const [phone, setPhone] = React.useState(initialPhone || '');
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setPhone(initialPhone || '');
      setError(null);
      setSaving(false);
    }
  }, [isOpen, initialPhone]);

  const validate = (value) => {
    const v = String(value || '').trim();
    if (v.length < 7) return 'Please enter a valid phone number';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate(phone);
    if (err) { setError(err); return; }
    try {
      setSaving(true);
      await onSubmit(String(phone).trim());
    } catch (e) {
      setError(e?.message || 'Failed to save phone number');
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => !saving && onClose()}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your Phone Number</h3>
        <p className="text-sm text-gray-600 mb-4">A phone number is required to share or claim food so donors and recipients can coordinate pickup.</p>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., (555) 123-4567"
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={saving}
          />
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

try { window.PhoneModal = PhoneModal; } catch (e) {}
