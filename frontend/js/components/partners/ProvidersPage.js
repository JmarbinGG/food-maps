// Food Maps Providers page — platform greens (#10b981 / #059669 / #f0fdf4).

const PROVIDER_TYPE_TAGS = [
  "Food pantry",
  "Mobile food pantry",
  "Home delivery",
  "Community fridge",
  "Community meal / hot meals",
  "Senior meal program",
  "School meal program",
  "Food box distribution",
  "Grocery assistance",
  "Farmers market",
  "Produce distribution",
  "Food rescue",
  "Community Closet",
  "Community Garden",
  "School food distribution",
  "Meal preparation program",
];

const PROVIDER_TYPE_COLOR_MAP = {
  "Food pantry": {
    selected: "bg-amber-600 text-white border-amber-600",
    idle: "bg-amber-50 text-amber-900 border-amber-300 hover:border-amber-500",
    chip: "bg-amber-100 text-amber-900 border-amber-300",
    filterActive: "bg-amber-600 text-white border-amber-600",
    filterIdle: "bg-white text-amber-800 border-amber-400 hover:bg-amber-600 hover:text-white",
  },
  "Mobile food pantry": {
    selected: "bg-orange-600 text-white border-orange-600",
    idle: "bg-orange-50 text-orange-900 border-orange-300 hover:border-orange-500",
    chip: "bg-orange-100 text-orange-900 border-orange-300",
    filterActive: "bg-orange-600 text-white border-orange-600",
    filterIdle: "bg-white text-orange-800 border-orange-400 hover:bg-orange-600 hover:text-white",
  },
  "Home delivery": {
    selected: "bg-sky-600 text-white border-sky-600",
    idle: "bg-sky-50 text-sky-900 border-sky-300 hover:border-sky-500",
    chip: "bg-sky-100 text-sky-900 border-sky-300",
    filterActive: "bg-sky-600 text-white border-sky-600",
    filterIdle: "bg-white text-sky-800 border-sky-400 hover:bg-sky-600 hover:text-white",
  },
  "Community fridge": {
    selected: "bg-cyan-600 text-white border-cyan-600",
    idle: "bg-cyan-50 text-cyan-900 border-cyan-300 hover:border-cyan-500",
    chip: "bg-cyan-100 text-cyan-900 border-cyan-300",
    filterActive: "bg-cyan-600 text-white border-cyan-600",
    filterIdle: "bg-white text-cyan-800 border-cyan-400 hover:bg-cyan-600 hover:text-white",
  },
  "Community meal / hot meals": {
    selected: "bg-rose-600 text-white border-rose-600",
    idle: "bg-rose-50 text-rose-900 border-rose-300 hover:border-rose-500",
    chip: "bg-rose-100 text-rose-900 border-rose-300",
    filterActive: "bg-rose-600 text-white border-rose-600",
    filterIdle: "bg-white text-rose-800 border-rose-400 hover:bg-rose-600 hover:text-white",
  },
  "Senior meal program": {
    selected: "bg-purple-600 text-white border-purple-600",
    idle: "bg-purple-50 text-purple-900 border-purple-300 hover:border-purple-500",
    chip: "bg-purple-100 text-purple-900 border-purple-300",
    filterActive: "bg-purple-600 text-white border-purple-600",
    filterIdle: "bg-white text-purple-800 border-purple-400 hover:bg-purple-600 hover:text-white",
  },
  "School meal program": {
    selected: "bg-indigo-600 text-white border-indigo-600",
    idle: "bg-indigo-50 text-indigo-900 border-indigo-300 hover:border-indigo-500",
    chip: "bg-indigo-100 text-indigo-900 border-indigo-300",
    filterActive: "bg-indigo-600 text-white border-indigo-600",
    filterIdle: "bg-white text-indigo-800 border-indigo-400 hover:bg-indigo-600 hover:text-white",
  },
  "Food box distribution": {
    selected: "bg-yellow-500 text-yellow-950 border-yellow-500",
    idle: "bg-yellow-50 text-yellow-900 border-yellow-300 hover:border-yellow-500",
    chip: "bg-yellow-100 text-yellow-900 border-yellow-300",
    filterActive: "bg-yellow-500 text-yellow-950 border-yellow-500",
    filterIdle: "bg-white text-yellow-800 border-yellow-400 hover:bg-yellow-500 hover:text-yellow-950",
  },
  "Grocery assistance": {
    selected: "bg-lime-600 text-white border-lime-600",
    idle: "bg-lime-50 text-lime-900 border-lime-300 hover:border-lime-500",
    chip: "bg-lime-100 text-lime-900 border-lime-300",
    filterActive: "bg-lime-600 text-white border-lime-600",
    filterIdle: "bg-white text-lime-800 border-lime-400 hover:bg-lime-600 hover:text-white",
  },
  "Farmers market": {
    selected: "bg-emerald-600 text-white border-emerald-600",
    idle: "bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500",
    chip: "bg-emerald-100 text-emerald-900 border-emerald-300",
    filterActive: "bg-emerald-600 text-white border-emerald-600",
    filterIdle: "bg-white text-emerald-800 border-emerald-400 hover:bg-emerald-600 hover:text-white",
  },
  "Produce distribution": {
    selected: "bg-green-600 text-white border-green-600",
    idle: "bg-green-50 text-green-900 border-green-300 hover:border-green-500",
    chip: "bg-green-100 text-green-900 border-green-300",
    filterActive: "bg-green-600 text-white border-green-600",
    filterIdle: "bg-white text-green-800 border-green-400 hover:bg-green-600 hover:text-white",
  },
  "Food rescue": {
    selected: "bg-teal-600 text-white border-teal-600",
    idle: "bg-teal-50 text-teal-900 border-teal-300 hover:border-teal-500",
    chip: "bg-teal-100 text-teal-900 border-teal-300",
    filterActive: "bg-teal-600 text-white border-teal-600",
    filterIdle: "bg-white text-teal-800 border-teal-400 hover:bg-teal-600 hover:text-white",
  },
  "Community Closet": {
    selected: "bg-fuchsia-600 text-white border-fuchsia-600",
    idle: "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-300 hover:border-fuchsia-500",
    chip: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300",
    filterActive: "bg-fuchsia-600 text-white border-fuchsia-600",
    filterIdle: "bg-white text-fuchsia-800 border-fuchsia-400 hover:bg-fuchsia-600 hover:text-white",
  },
  "Community Garden": {
    selected: "bg-green-700 text-white border-green-700",
    idle: "bg-green-50 text-green-900 border-green-400 hover:border-green-600",
    chip: "bg-green-200 text-green-950 border-green-500",
    filterActive: "bg-green-700 text-white border-green-700",
    filterIdle: "bg-white text-green-800 border-green-500 hover:bg-green-700 hover:text-white",
  },
  "School food distribution": {
    selected: "bg-blue-600 text-white border-blue-600",
    idle: "bg-blue-50 text-blue-900 border-blue-300 hover:border-blue-500",
    chip: "bg-blue-100 text-blue-900 border-blue-300",
    filterActive: "bg-blue-600 text-white border-blue-600",
    filterIdle: "bg-white text-blue-800 border-blue-400 hover:bg-blue-600 hover:text-white",
  },
  "Meal preparation program": {
    selected: "bg-pink-600 text-white border-pink-600",
    idle: "bg-pink-50 text-pink-900 border-pink-300 hover:border-pink-500",
    chip: "bg-pink-100 text-pink-900 border-pink-300",
    filterActive: "bg-pink-600 text-white border-pink-600",
    filterIdle: "bg-white text-pink-800 border-pink-400 hover:bg-pink-600 hover:text-white",
  },
};

const PROVIDER_TYPE_COLOR_FALLBACK = {
  selected: "bg-slate-700 text-white border-slate-700",
  idle: "bg-white text-gray-700 border-gray-300 hover:border-slate-500",
  chip: "bg-slate-100 text-slate-800 border-slate-300",
  filterActive: "bg-slate-700 text-white border-slate-700",
  filterIdle: "bg-white text-slate-800 border-slate-400 hover:bg-slate-700 hover:text-white",
};

function getProviderTypeClasses(tag, variant = "chip") {
  if (typeof window !== "undefined" && typeof window.getProviderTypeClasses === "function"
      && window.getProviderTypeClasses !== getProviderTypeClasses) {
    try {
      return window.getProviderTypeClasses(tag, variant);
    } catch (_) { /* use local */ }
  }
  const colors = PROVIDER_TYPE_COLOR_MAP[tag] || PROVIDER_TYPE_COLOR_FALLBACK;
  return colors[variant] || colors.chip;
}

const AVAILABILITY_LABELS = {
  open: "Walk-in welcome",
  limited: "Limited availability",
  appointment: "Appointment required",
  first_come: "First come, first served",
  seasonal: "Seasonal / varies",
  closed: "Temporarily closed",
};

function parseProviderTypes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
  } catch (_) { /* ignore */ }
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapsUrl(address) {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function telUrl(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}

function webUrl(website) {
  if (!website) return null;
  const s = String(website).trim();
  if (!s) return null;
  return s.startsWith("http") ? s : `https://${s}`;
}

const SCHOOL_ELIGIBILITY_NOTE =
  "Schools only serve their students and families.";

const PROVIDERS_COPY_DEFAULTS = {
  "hero-badge": "Providers",
  "hero-title": "Find food nearby",
  "hero-subtitle":
    "Pantries, community closets, school sites, and meal programs — filter by type, then call or get directions.",
  "school-note": "<span class=\"font-semibold\">School sites:</span> Schools only serve their students and families.",
};

const ProvidersHero = React.memo(function ProvidersHero({ fields, search, setSearch, searchRef }) {
  return (
    <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white border-b border-green-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <p
          className="text-sm font-semibold uppercase tracking-wide text-green-200 mb-2 editable"
          data-editable="hero-badge"
          contentEditable={false}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: fields["hero-badge"] }}
        />
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 editable"
          data-editable="hero-title"
          contentEditable={false}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: fields["hero-title"] }}
        />
        <p
          className="text-green-100 text-base sm:text-lg max-w-xl leading-relaxed editable"
          data-editable="hero-subtitle"
          contentEditable={false}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: fields["hero-subtitle"] }}
        />
        <p
          className="mt-4 max-w-2xl rounded-lg border border-amber-300/40 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 leading-relaxed editable"
          data-editable="school-note"
          contentEditable={false}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: fields["school-note"] }}
        />

        <div className="mt-6 relative max-w-xl">
          <label htmlFor="provider-search" className="sr-only">Search providers</label>
          <input
            ref={searchRef}
            id="provider-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, street, or neighborhood…"
            className="w-full pl-4 pr-11 py-3 border-2 border-green-600 rounded-xl text-base text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-800 text-sm font-medium"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
});

const SCHOOL_PROVIDER_TYPES = new Set([
  "School meal program",
  "School food distribution",
]);

function isSchoolProvider(center) {
  if (!center) return false;
  if (center.school_partner) return true;
  if (String(center.partner_badge || "").toLowerCase() === "school") return true;
  const types = parseProviderTypes(center.provider_types);
  if (types.some((t) => SCHOOL_PROVIDER_TYPES.has(t))) return true;
  const text = `${center.name || ""} ${center.description || ""}`.toLowerCase();
  return /\bschool\b/.test(text);
}

function ProviderCard({ center }) {
  const [expanded, setExpanded] = React.useState(false);
  const types = parseProviderTypes(center.provider_types);
  const isSchool = isSchoolProvider(center);
  const availability =
    center.availability && (AVAILABILITY_LABELS[center.availability] || center.availability);
  const phoneHref = telUrl(center.phone);
  const directionsHref = mapsUrl(center.address);
  const websiteHref = webUrl(center.website);

  const hasDetails = Boolean(
    center.description ||
    center.eligibility ||
    center.languages ||
    center.coverage_areas ||
    center.social_media ||
    websiteHref ||
    availability
  );

  const visibleTypes = types.slice(0, 2);
  const extraTypeCount = Math.max(0, types.length - visibleTypes.length);

  return (
    <article className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:border-green-700">
      <div className="h-1.5 bg-green-800" aria-hidden="true" />
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900 leading-snug tracking-tight group-hover:text-green-800 transition-colors">
            {center.name}
          </h2>
          {availability && (
            <span
              className={`shrink-0 mt-0.5 text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md ${
                center.availability === "closed"
                  ? "bg-gray-200 text-gray-700"
                  : center.availability === "open" || center.availability === "first_come"
                  ? "bg-green-800 text-white"
                  : "bg-green-700 text-white"
              }`}
            >
              {availability}
            </span>
          )}
        </div>

        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visibleTypes.map((t) => (
              <span
                key={t}
                className={`text-xs font-semibold border px-2 py-0.5 rounded-md ${getProviderTypeClasses(t, "chip")}`}
              >
                {t}
              </span>
            ))}
            {extraTypeCount > 0 && (
              <span className="text-xs font-medium text-green-700 px-1.5 py-0.5">
                +{extraTypeCount} more
              </span>
            )}
          </div>
        )}

        {isSchool && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 leading-relaxed">
            <span className="font-semibold">Eligibility:</span> {SCHOOL_ELIGIBILITY_NOTE}
          </p>
        )}

        <div className="space-y-2.5 text-sm text-gray-700 mb-5">
          {center.address && (
            <p className="leading-relaxed">
              <span className="text-xs font-semibold uppercase tracking-wide text-green-800 block mb-0.5">Address</span>
              {center.address}
            </p>
          )}
          {center.hours && (
            <p className="leading-relaxed">
              <span className="text-xs font-semibold uppercase tracking-wide text-green-800 block mb-0.5">Hours</span>
              {center.hours}
            </p>
          )}
          {center.phone && (
            <p className="leading-relaxed">
              <span className="text-xs font-semibold uppercase tracking-wide text-green-800 block mb-0.5">Phone</span>
              {phoneHref ? (
                <a href={phoneHref} className="text-green-800 font-semibold hover:text-green-900 hover:underline">
                  {center.phone}
                </a>
              ) : (
                <span>{center.phone}</span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-auto">
          {phoneHref && (
            <a
              href={phoneHref}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
            >
              Call
            </a>
          )}
          {directionsHref && (
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border-2 border-green-700 text-green-800 hover:bg-green-800 hover:text-white text-sm font-semibold transition-colors bg-white"
            >
              Directions
            </a>
          )}
          {hasDetails && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-green-800 hover:bg-gray-100 transition-colors"
            >
              {expanded ? "Less" : "More details"}
              <span className="ml-1.5 text-xs opacity-70" aria-hidden="true">
                {expanded ? "▴" : "▾"}
              </span>
            </button>
          )}
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-gray-200 bg-gray-50">
          <div className="pt-4 space-y-3 text-sm">
            {center.description && (
              <p className="text-gray-600 leading-relaxed">{center.description}</p>
            )}
            {types.length > 2 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800 mb-1.5">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {types.map((t) => (
                    <span key={t} className="text-xs font-semibold text-green-800 border border-green-700 px-2 py-0.5 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {center.eligibility && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800 mb-0.5">Eligibility</p>
                <p className="text-gray-800">{center.eligibility}</p>
              </div>
            )}
            {center.languages && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800 mb-0.5">Languages</p>
                <p className="text-gray-800">{center.languages}</p>
              </div>
            )}
            {center.coverage_areas && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800 mb-0.5">Coverage areas</p>
                <p className="text-gray-800">{center.coverage_areas}</p>
              </div>
            )}
            {websiteHref && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800 mb-0.5">Website</p>
                <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-green-800 hover:underline break-all">
                  {center.website}
                </a>
              </div>
            )}
            {center.social_media && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800 mb-0.5">Social</p>
                <p className="text-gray-800">{center.social_media}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function ProvidersPage() {
  const [centers, setCenters] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const searchRef = React.useRef(null);
  const [fields, setFields] = React.useState(PROVIDERS_COPY_DEFAULTS);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/centers");
        if (!res.ok) throw new Error("Failed to load providers");
        const data = await res.json();
        if (!cancelled) {
          const list = Array.isArray(data) ? data.filter((c) => c && c.is_active !== false) : [];
          list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }));
          setCenters(list);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Unable to load providers right now. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pages/providers/content");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data || !data.content) return;
        setFields((prev) => ({ ...prev, ...data.content }));
      } catch (_) { /* keep defaults */ }
    })();
    const onSaved = (e) => {
      if (e.detail && e.detail.pageId === "providers" && e.detail.content) {
        setFields((prev) => ({ ...prev, ...e.detail.content }));
      }
    };
    window.addEventListener("foodmaps:pagecontent-saved", onSaved);
    return () => {
      cancelled = true;
      window.removeEventListener("foodmaps:pagecontent-saved", onSaved);
    };
  }, []);

  const tagCounts = React.useMemo(() => {
    const counts = {};
    for (const tag of PROVIDER_TYPE_TAGS) counts[tag] = 0;
    for (const c of centers) {
      const types = parseProviderTypes(c.provider_types);
      for (const t of types) {
        if (counts[t] != null) counts[t] += 1;
      }
    }
    return counts;
  }, [centers]);

  const orderedTags = React.useMemo(() => {
    return [...PROVIDER_TYPE_TAGS].sort((a, b) => {
      const ca = tagCounts[a] || 0;
      const cb = tagCounts[b] || 0;
      if (ca === 0 && cb > 0) return 1;
      if (cb === 0 && ca > 0) return -1;
      return 0;
    });
  }, [tagCounts]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearch("");
    try { searchRef.current && searchRef.current.focus(); } catch (_) { /* ignore */ }
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return centers.filter((c) => {
      const types = parseProviderTypes(c.provider_types);
      if (selectedTags.length > 0) {
        if (!selectedTags.some((t) => types.includes(t))) return false;
      }
      if (!q) return true;
      const hay = [
        c.name,
        c.description,
        c.address,
        c.phone,
        c.hours,
        c.eligibility,
        c.languages,
        c.coverage_areas,
        types.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [centers, selectedTags, search]);

  const hasActiveFilters = selectedTags.length > 0 || search.trim().length > 0;

  return (
    <div className="bg-white min-h-[60vh]">
      <ProvidersHero
        fields={fields}
        search={search}
        setSearch={setSearch}
        searchRef={searchRef}
      />

      <section className="sticky top-24 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
              Filter by type
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-green-800 hover:text-green-950 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
            role="group"
            aria-label="Provider type filters"
          >
            <button
              type="button"
              onClick={() => setSelectedTags([])}
              aria-pressed={selectedTags.length === 0}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                selectedTags.length === 0
                  ? "bg-green-800 text-white border-green-800"
                  : "bg-white text-green-800 border-green-700 hover:bg-green-800 hover:text-white"
              }`}
            >
              All
              {!loading && (
                <span className="ml-1.5 opacity-80 tabular-nums">{centers.length}</span>
              )}
            </button>
            {orderedTags.map((tag) => {
              const count = tagCounts[tag] || 0;
              const active = selectedTags.includes(tag);
              const disabled = count === 0;
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  title={disabled ? "No providers with this type yet" : undefined}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors whitespace-nowrap ${
                    disabled
                      ? "bg-transparent text-gray-300 border-gray-200 cursor-not-allowed"
                      : active
                      ? getProviderTypeClasses(tag, "filterActive")
                      : getProviderTypeClasses(tag, "filterIdle")
                  }`}
                >
                  {tag}
                  {!disabled && (
                    <span className={`ml-1.5 tabular-nums ${active ? "opacity-80" : "opacity-70"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 bg-gray-50">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading providers">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-red-800" role="alert">
            <p className="font-semibold mb-1">Something went wrong</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-semibold underline"
            >
              Reload page
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-baseline justify-between gap-3 mb-5">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-800 tabular-nums">{filtered.length}</span>
                {" "}
                {filtered.length === 1 ? "provider" : "providers"}
                {hasActiveFilters ? " matching your filters" : ""}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-green-700 bg-white px-6 py-14 text-center">
                <p className="text-gray-900 font-semibold mb-1">No providers match</p>
                <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                  Try a different type, or clear filters to see everything.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((center) => (
                  <ProviderCard key={center.id} center={center} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

window.ProvidersPage = ProvidersPage;
window.PROVIDER_TYPE_TAGS = PROVIDER_TYPE_TAGS;
window.PROVIDER_TYPE_COLOR_MAP = PROVIDER_TYPE_COLOR_MAP;
window.getProviderTypeClasses = getProviderTypeClasses;
