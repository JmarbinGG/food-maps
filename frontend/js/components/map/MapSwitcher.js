// Centered dropdown for switching between the public map and the private
// community maps the signed-in user can open. Hidden when only the public
// map is available.
function MapSwitcher({ maps, activeMap, onChange }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!Array.isArray(maps) || maps.length < 2) return null;

  const current = maps.find((m) => m.key === activeMap) || maps[0];
  const isPrivate = current.key !== 'public';

  return (
    <div
      ref={rootRef}
      className="absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      data-name="map-switcher"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current map: ${current.label}. Change map`}
        className={`flex items-center gap-2 pl-3 pr-2 py-2 rounded-full shadow-md border text-sm font-semibold transition-colors max-w-[80vw] ${isPrivate
          ? 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700'
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
          }`}
      >
        <span className={`${isPrivate ? 'icon-lock' : 'icon-globe'} text-base shrink-0`} aria-hidden="true"></span>
        <span className="truncate">{current.label}</span>
        <span className={`icon-chevron-down text-base shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true"></span>
      </button>

      {isPrivate && !open && (
        <span className="mt-1 px-2 py-0.5 rounded-full bg-white/90 text-[11px] text-indigo-800 shadow-sm">
          Only members can see these listings
        </span>
      )}

      {open && (
        <ul
          role="listbox"
          aria-label="Choose a map"
          className="mt-2 w-64 max-w-[80vw] bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-y-auto max-h-[50vh]"
        >
          {maps.map((m) => {
            const selected = m.key === current.key;
            const priv = m.key !== 'public';
            return (
              <li key={m.key} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (!selected) onChange(m.key);
                  }}
                  className={`w-full flex items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${selected ? 'bg-gray-50' : ''}`}
                >
                  <span
                    className={`${priv ? 'icon-lock text-indigo-600' : 'icon-globe text-green-700'} text-base mt-0.5 shrink-0`}
                    aria-hidden="true"
                  ></span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-gray-900 truncate">{m.label}</span>
                    <span className="block text-xs text-gray-500">
                      {priv ? 'Private · members only' : 'Everyone can see these listings'}
                    </span>
                  </span>
                  {selected && <span className="icon-check text-base text-green-700 mt-0.5 shrink-0" aria-hidden="true"></span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

window.MapSwitcher = MapSwitcher;
