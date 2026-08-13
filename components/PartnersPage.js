// Food Maps Partners page — platform green / dark green palette.

const localPartners = [
  {
    name: "The Cheese Board Collective",
    img: "/logos/partners/cheese_board.png",
    website: "https://cheeseboardcollective.coop/",
    description: "A worker-owned cooperative bakery and pizzeria in Berkeley since 1971.",
  },
  {
    name: "Alameda County Community Food Bank",
    img: "/logos/partners/accfb.png",
    website: "https://accfb.org",
    description: "A nonprofit that supplies food to 400+ partner agencies across Alameda County.",
  },
  {
    name: "Semifreddi's",
    img: "/logos/partners/semifreddis_logo.png",
    website: "https://www.semifreddis.com/",
    description: "An Alameda-based artisan bakery serving the San Francisco Bay Area.",
  },
  {
    name: "Alameda Food Bank",
    img: "/logos/partners/alameda_food_bank.png",
    website: "https://www.alamedafoodbank.org/",
    description: "Founded in 1977, helping the Alameda community with nourishing food for neighbors in need.",
  },
  {
    name: "Community Kitchen",
    img: "/logos/partners/community_kitchen.png",
    website: "https://www.ckoakland.org/",
    description: "Harnessing the power of food to change lives, uplift communities, and protect the environment.",
  },
  {
    name: "Berkeley Pizza Collective",
    img: "/logos/partners/share_pizza.png",
    website: "https://www.sharepizzakitchen.com",
    description: "Sourdough pizza — crispy outside, soft inside — crafted for the Bay Area community.",
  },
  {
    name: "Food Shift",
    img: "/logos/partners/foodshift.png",
    website: "https://foodshift.net",
    description: "Transforming surplus into opportunity since 2012 — reducing waste and nourishing Bay Area neighbors.",
  },
  {
    name: "Food Recovery",
    img: "/logos/partners/foodrecovery.png",
    website: "https://foodrecovery.org",
    description: "Connecting food donors with nonprofits to fight hunger and reduce waste — free for everyone.",
  },
  {
    name: "All Good Living Foundation",
    img: "/logos/partners/allgoodliving.png",
    website: "https://allgoodlivingfoundation.org/",
    description: "Supporting students and families in Alameda, Oakland, and nearby communities through food access and youth services.",
  },
  {
    name: "Trybe Inc.",
    img: "/logos/partners/trybe.jpg",
    website: "https://www.trybeinc.org",
    description: "A community nonprofit rooted in Oakland's Eastlake / San Antonio / Fruitvale area, serving youth and families across the East Bay.",
  },
];

function inferCategory(partner) {
  if (partner.category) return partner.category;
  const text = `${partner.name || ""} ${partner.description || ""}`.toLowerCase();
  if (/bakery|bread|pizza|cheese|kitchen/.test(text)) return "Bakery & Kitchen";
  if (/food bank|community food|pantry/.test(text)) return "Food Bank";
  if (/recovery|recover|shift|surplus|waste/.test(text)) return "Food Recovery";
  if (/farm|produce|grocer/.test(text)) return "Farm & Producer";
  if (/youth|community|family|foundation|inc\.?$|non[- ]?profit/.test(text)) return "Community";
  return "Partner";
}

const PARTNERS_COPY_DEFAULTS = {
  "hero-badge": "Community Partners",
  "hero-title": 'Together we rescue food, <span class="text-green-200">not just plates</span>',
  "hero-subtitle":
    "Local businesses, food banks, and nonprofits power Food Maps every day. Their impact is your community's impact.",
  "cta-badge": "Now welcoming new partners",
  "cta-title": "Put your brand behind real community impact",
  "cta-subtitle":
    "Join Bay Area leaders fighting hunger and food waste. We'll help tell and amplify your impact.",
};

const PartnersHero = React.memo(function PartnersHero({ fields, partnerCount, loading }) {
  return (
    <header className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white border-b border-green-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="text-center">
          <span
            className="inline-flex items-center px-3 py-1 rounded-md bg-green-950/40 text-green-100 text-xs font-semibold mb-5 border border-green-600 editable"
            data-editable="hero-badge"
            contentEditable={false}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: fields["hero-badge"] }}
          />
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 tracking-tight editable"
            data-editable="hero-title"
            contentEditable={false}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: fields["hero-title"] }}
          />
          <p
            className="text-base sm:text-lg text-green-100 max-w-2xl mx-auto leading-relaxed editable"
            data-editable="hero-subtitle"
            contentEditable={false}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: fields["hero-subtitle"] }}
          />

          {!loading && partnerCount > 0 && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-green-800 font-medium border-2 border-white">
                <strong className="tabular-nums">{partnerCount}</strong>
                <span>partners</span>
              </span>
              <a
                href="#become-partner"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-green-950 text-white font-semibold border-2 border-green-950 hover:bg-black transition-colors"
              >
                Become a partner
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="h-1.5 bg-green-800" />
      <div className="h-44 bg-gray-100 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 bg-gray-100 rounded-lg animate-pulse mt-2" />
      </div>
    </div>
  );
}

function partnerSlug(name) {
  return String(name || "partner")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "partner";
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]*>/g, "").trim();
}

function mergePartnersWithContent(list, content) {
  const c = content || {};
  return (list || []).map((p) => {
    const slug = partnerSlug(p.name);
    const nameHtml = c[`partner-${slug}-name`];
    const descHtml = c[`partner-${slug}-desc`];
    const img = c[`img_partner-${slug}-img`] || c[`img_partner-${slug}`];
    return {
      ...p,
      _slug: slug,
      name: nameHtml != null ? stripTags(nameHtml) || p.name : p.name,
      nameHtml: nameHtml != null ? nameHtml : p.name,
      description: descHtml != null ? stripTags(descHtml) || p.description : p.description,
      descriptionHtml: descHtml != null ? descHtml : p.description,
      img: img || p.img,
    };
  });
}

function PartnerCard({ partner }) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const category = inferCategory(partner);
  const displayName = partner.name || "?";
  const initials = displayName
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0] && s[0].toUpperCase())
    .join("");
  const slug = partner._slug || partnerSlug(partner.name);
  const showImg = partner.img && !imgFailed;

  return (
    <article className="group relative bg-white rounded-xl border border-gray-200 hover:border-green-700 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      <div className="h-1.5 bg-green-800" aria-hidden="true" />
      <div className="relative h-44 bg-white flex items-center justify-center p-6 border-b border-gray-100">
        {showImg ? (
          <img
            src={partner.img}
            alt={`${displayName} logo`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            data-editable-img={`partner-${slug}-img`}
            className="editable-img max-h-28 max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-xl bg-green-800 flex items-center justify-center text-white font-bold text-xl mb-2">
              {initials || "P"}
            </div>
            <span className="text-xs font-medium text-gray-500 text-center px-2">{displayName}</span>
          </div>
        )}

        <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-md bg-white border-2 border-green-700 text-green-800 text-[10px] font-semibold uppercase tracking-wide">
          {category}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3
          className="text-lg font-semibold text-gray-900 mb-2 leading-tight group-hover:text-green-800 transition-colors editable"
          data-editable={`partner-${slug}-name`}
          contentEditable={false}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: partner.nameHtml || partner.name }}
        />
        <p
          className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1 editable"
          data-editable={`partner-${slug}-desc`}
          contentEditable={false}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: partner.descriptionHtml || partner.description }}
        />

        <div className="mt-auto" data-no-edit="true">
          {partner.website && partner.website !== "#" ? (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-green-700 text-white hover:bg-green-800 font-semibold text-sm transition-colors"
              aria-label={`Visit ${displayName} website (opens in new tab)`}
            >
              Visit website
            </a>
          ) : (
            <span className="block text-center text-gray-400 text-sm py-2">Website coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

function PartnersPage() {
  const [partners, setPartners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name");
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [fields, setFields] = React.useState(PARTNERS_COPY_DEFAULTS);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPartners(mergePartnersWithContent(localPartners, fields));
      setLoading(false);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    setPartners((prev) => {
      if (!prev.length) return prev;
      // Remerge from original local list so overrides stay consistent
      return mergePartnersWithContent(localPartners, fields);
    });
  }, [fields]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pages/partners/content");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data || !data.content) return;
        setFields((prev) => ({ ...prev, ...data.content }));
      } catch (_) { /* keep defaults */ }
    })();
    const onSaved = (e) => {
      if (e.detail && e.detail.pageId === "partners" && e.detail.content) {
        setFields((prev) => ({ ...prev, ...e.detail.content }));
      }
    };
    window.addEventListener("foodmaps:pagecontent-saved", onSaved);
    return () => {
      cancelled = true;
      window.removeEventListener("foodmaps:pagecontent-saved", onSaved);
    };
  }, []);

  const categories = React.useMemo(() => {
    const seen = new Set(partners.map(inferCategory));
    return ["All", ...Array.from(seen)];
  }, [partners]);

  const filteredPartners = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = partners.filter((s) => {
      if (activeCategory !== "All" && inferCategory(s) !== activeCategory) return false;
      if (!q) return true;
      return `${s.name || ""} ${s.description || ""}`.toLowerCase().includes(q);
    });
    if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return list;
  }, [partners, search, sortBy, activeCategory]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSortBy("name");
  };
  const hasActiveFilters = search.trim() || activeCategory !== "All";

  return (
    <div className="min-h-screen bg-white">
      <PartnersHero fields={fields} partnerCount={partners.length} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 bg-gray-50">
        {!loading && partners.length > 0 && (
          <section
            aria-label="Filter and sort partners"
            className="sticky top-24 z-20 -mx-4 sm:mx-0 px-4 sm:px-5 mb-6 py-3 bg-white/95 backdrop-blur-md border-b border-gray-200 sm:rounded-xl sm:border sm:border-gray-200 sm:shadow-sm sm:mt-8"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search partners by name or focus…"
                    className="w-full pl-4 pr-9 py-2.5 text-sm rounded-xl border-2 border-green-700 bg-white text-gray-900 placeholder-gray-400 focus:border-green-800 focus:ring-2 focus:ring-green-700/30 outline-none transition"
                    aria-label="Search partners"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-gray-400 hover:text-green-800 hover:bg-gray-100 flex items-center justify-center transition"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="partner-sort-select" className="text-xs font-semibold text-green-800 uppercase tracking-wide whitespace-nowrap">
                    Sort by
                  </label>
                  <select
                    id="partner-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border-2 border-green-700 bg-white text-gray-900 focus:border-green-800 focus:ring-2 focus:ring-green-700/30 outline-none cursor-pointer"
                  >
                    <option value="name">Name (A–Z)</option>
                  </select>
                </div>
              </div>

              {categories.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border-2 ${
                          isActive
                            ? "bg-green-800 text-white border-green-800"
                            : "bg-white text-green-800 border-green-700 hover:bg-green-700 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="ml-auto whitespace-nowrap inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-800 hover:bg-gray-100 transition"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8" aria-busy="true" aria-label="Loading partners">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No partners match those filters</h3>
            <p className="text-sm text-gray-500 mb-5">Try a different search or clear the filters.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-4 pt-2">
              Showing{" "}
              <strong className="text-green-800 tabular-nums">{filteredPartners.length}</strong>{" "}
              of {partners.length}{" "}
              {partners.length === 1 ? "partner" : "partners"}
              {activeCategory !== "All" && (
                <>
                  {" "}in <span className="text-green-800 font-medium">{activeCategory}</span>
                </>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <PartnerCard key={partner.id || partner.name} partner={partner} />
              ))}
            </div>
          </>
        )}

        <section id="become-partner" aria-labelledby="become-partner-heading" className="mt-20 scroll-mt-28">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-green-900">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700" aria-hidden="true" />

            <div className="relative p-8 sm:p-12 text-white">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-950/50 text-green-100 text-[11px] font-semibold mb-4 border border-green-600 editable" data-editable="cta-badge" contentEditable={false} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: fields["cta-badge"] }} />
                  <h2 id="become-partner-heading" className="text-3xl sm:text-4xl font-bold mb-4 leading-tight editable" data-editable="cta-title" contentEditable={false} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: fields["cta-title"] }} />
                  <p className="text-green-100 text-base sm:text-lg mb-6 leading-relaxed editable" data-editable="cta-subtitle" contentEditable={false} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: fields["cta-subtitle"] }} />
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="mailto:info@allgoodlivingfoundation.org?subject=Food%20Maps%20Partnership"
                      className="inline-flex items-center bg-white text-green-800 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg"
                    >
                      Start the conversation
                    </a>
                    <a
                      href="mailto:info@allgoodlivingfoundation.org"
                      className="inline-flex items-center gap-2 text-green-100 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition"
                    >
                      info@allgoodlivingfoundation.org
                    </a>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Partner benefits">
                  {[
                    { key: "benefit-reach", title: "Community reach", body: "Connect with families and neighbors across the Bay Area." },
                    { key: "benefit-visibility", title: "Brand visibility", body: "Logo placement here and across community communications." },
                    { key: "benefit-volunteer", title: "Volunteer programs", body: "Engage your team with hands-on food-rescue events." },
                    { key: "benefit-tax", title: "Tax-deductible", body: "Donations routed through our 501(c)(3) partner network." },
                  ].map((b) => (
                    <li key={b.key} className="bg-green-950/40 rounded-xl p-4 border border-green-600/50">
                      <div
                        className="font-semibold text-sm mb-1.5 editable"
                        data-editable={`${b.key}-title`}
                        contentEditable={false}
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: fields[`${b.key}-title`] || b.title }}
                      />
                      <p
                        className="text-[12px] text-green-100 leading-relaxed editable"
                        data-editable={`${b.key}-body`}
                        contentEditable={false}
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: fields[`${b.key}-body`] || b.body }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

window.PartnersPage = PartnersPage;
