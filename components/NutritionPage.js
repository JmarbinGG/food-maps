// Food Maps Nutrition — editorial, interactive guidance for shared food.

const PLATE_PARTS = [
  {
    id: "protein",
    label: "Protein",
    color: "#1a6b45",
    blurb: "Beans, eggs, yogurt, cheese, peanut butter, canned tuna or chicken, and leftover meals keep energy steady.",
  },
  {
    id: "produce",
    label: "Produce",
    color: "#3d9a62",
    blurb: "Fresh, frozen, or canned — color on the plate means vitamins and fiber. Rinse canned veggies when you can.",
  },
  {
    id: "carbs",
    label: "Carbs",
    color: "#c4a35a",
    blurb: "Rice, bread, pasta, tortillas, oats, and potatoes make meals filling. Pair with protein so you stay satisfied.",
  },
];

const USE_NOW = [
  {
    label: "Use first",
    items: "Leafy greens, soft fruit, prepared meals, fresh milk, cut produce",
  },
  {
    label: "Use soon",
    items: "Firm fruit, root veggies, bread, yogurt, eggs",
  },
  {
    label: "Holds longer",
    items: "Canned goods, dry beans/rice, frozen food, citrus, cabbage",
  },
];

const MEAL_IDEAS = [
  {
    name: "Bean & veggie skillet",
    bits: "Canned beans + vegetables + rice or tortillas. Add salsa or garlic if you have it.",
  },
  {
    name: "Egg scramble bowl",
    bits: "Eggs + leftover greens or veggies + toast. Fast protein for breakfast or dinner.",
  },
  {
    name: "Tuna or chicken wraps",
    bits: "Canned fish or chicken + tortillas + crunchy produce. Stretch with beans or rice.",
  },
  {
    name: "Soup stretch",
    bits: "Canned soup + frozen veggies + leftover pasta or rice for more servings and fiber.",
  },
  {
    name: "Parfait or oats",
    bits: "Yogurt or oatmeal + fruit + peanut butter. Lasting energy with almost no cooking.",
  },
  {
    name: "Leftover remix",
    bits: "Prepared meal + a side of produce or beans. Color and protein turn one serving into a full plate.",
  },
];

const DATE_GUIDE = [
  {
    label: "Best by",
    meaning: "Peak quality. Usually still fine after if stored well and looks/smells normal.",
  },
  {
    label: "Sell by",
    meaning: "For stores. Many foods stay good for days afterward in the fridge.",
  },
  {
    label: "Use by",
    meaning: "Quality guidance for most foods. Trust your senses; when unsure, skip it.",
  },
  {
    label: "Expires on",
    meaning: "Harder cutoff for sensitive items. Discard after this date.",
  },
];

const FAMILY_LINE =
  "Offer kids the same foods adults eat when you can. Familiar meals build comfort with shared food — and less goes to waste.";

function useRevealOnScroll() {
  React.useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".nx-reveal"));
    if (!nodes.length) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

function useActiveSection(ids) {
  const [active, setActive] = React.useState(ids[0]);
  React.useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [ids.join("|")]);
  return active;
}

function PlateGuide() {
  const [activeId, setActiveId] = React.useState("protein");
  const active = PLATE_PARTS.find((p) => p.id === activeId) || PLATE_PARTS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="relative mx-auto w-full max-w-md">
        <svg viewBox="0 0 320 320" className="w-full drop-shadow-sm" role="img" aria-label="Interactive balanced plate">
          <circle cx="160" cy="160" r="148" fill="#f3f7f4" stroke="#d5e4da" strokeWidth="2" />
          {/* Produce ~40% */}
          <path
            className={`nx-plate-btn ${activeId === "produce" ? "is-active" : ""}`}
            d="M160 160 L160 20 A140 140 0 0 1 286 230 Z"
            fill={PLATE_PARTS[1].color}
            onClick={() => setActiveId("produce")}
          />
          {/* Carbs ~30% */}
          <path
            className={`nx-plate-btn ${activeId === "carbs" ? "is-active" : ""}`}
            d="M160 160 L286 230 A140 140 0 0 1 34 230 Z"
            fill={PLATE_PARTS[2].color}
            onClick={() => setActiveId("carbs")}
          />
          {/* Protein ~30% */}
          <path
            className={`nx-plate-btn ${activeId === "protein" ? "is-active" : ""}`}
            d="M160 160 L34 230 A140 140 0 0 1 160 20 Z"
            fill={PLATE_PARTS[0].color}
            onClick={() => setActiveId("protein")}
          />
          <circle cx="160" cy="160" r="36" fill="#fff" stroke="#e5eee8" strokeWidth="2" />
          <text x="160" y="166" textAnchor="middle" fontSize="13" fontFamily="Manrope, sans-serif" fontWeight="700" fill="#0f3d2e">
            Plate
          </text>
        </svg>
        <p className="text-center text-sm text-[var(--nx-stone)] mt-3">Tap a section to learn what to put there</p>
      </div>

      <div>
        <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--nx-leaf)] mb-3">
          Build the plate
        </p>
        <h2 className="nx-display text-3xl sm:text-4xl text-[var(--nx-forest)] mb-4">
          Three parts. Endless meals.
        </h2>
        <p className="text-[var(--nx-stone)] text-lg mb-8 max-w-md leading-relaxed">
          You do not need a perfect kitchen — just aim for filling, colorful, and lasting from whatever you pick up.
        </p>

        <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Plate sections">
          {PLATE_PARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              role="tab"
              aria-selected={activeId === part.id}
              onClick={() => setActiveId(part.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                activeId === part.id
                  ? "bg-[var(--nx-forest)] text-white border-[var(--nx-forest)]"
                  : "bg-white text-[var(--nx-ink)] border-[rgba(15,61,46,0.18)] hover:border-[var(--nx-leaf)]"
              }`}
            >
              {part.label}
            </button>
          ))}
        </div>

        <div
          key={active.id}
          className="border-l-4 pl-5 py-1"
          style={{ borderColor: active.color }}
        >
          <h3 className="nx-display text-2xl text-[var(--nx-ink)] mb-2">{active.label}</h3>
          <p className="text-[var(--nx-stone)] leading-relaxed text-[17px]">{active.blurb}</p>
        </div>
      </div>
    </div>
  );
}

function NutritionPage() {
  const sectionIds = React.useMemo(
    () => ["plate", "timing", "meals", "dates", "families"],
    []
  );
  const activeSection = useActiveSection(sectionIds);
  useRevealOnScroll();

  const nav = [
    { id: "plate", label: "The plate" },
    { id: "timing", label: "What to use" },
    { id: "meals", label: "Meals" },
    { id: "dates", label: "Date labels" },
    { id: "families", label: "Families" },
  ];

  return (
    <div className="bg-[var(--nx-cream)]">
      {/* Hero — one composition: brand, headline, line, CTAs, full-bleed food */}
      <section className="nx-hero" aria-label="Nutrition hero">
        <div className="nx-hero__media" aria-hidden="true" />
        <div className="nx-hero__content">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <p className="nx-brand">Food Maps</p>
            <h1 className="nx-display text-3xl sm:text-5xl max-w-xl mb-4 font-semibold">
              Eat well with shared food
            </h1>
            <p className="text-white/85 text-lg sm:text-xl max-w-md leading-relaxed mb-8">
              Stretch rescued meals into balanced plates — simple habits for real kitchens.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="index.html"
                className="inline-flex items-center justify-center bg-white text-[var(--nx-forest)] px-6 py-3 rounded-xl font-semibold hover:bg-[var(--nx-sage)] transition-colors"
              >
                Find food nearby
              </a>
              <a
                href="#plate"
                className="inline-flex items-center justify-center border border-white/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky section rail */}
      <div className="sticky top-20 sm:top-24 z-40 bg-[var(--nx-cream)]/95 backdrop-blur border-b border-[rgba(15,61,46,0.08)]">
        <nav className="nx-rail max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto" aria-label="On this page">
          <ul className="flex gap-6 sm:gap-8 py-3 text-sm font-semibold whitespace-nowrap">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeSection === item.id ? "is-active" : ""}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section id="plate" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 nx-reveal">
        <PlateGuide />
      </section>

      <section id="timing" className="relative overflow-hidden nx-reveal">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #e8f1eb 0%, #f7faf8 100%)",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--nx-leaf)] mb-3">
              Timing
            </p>
            <h2 className="nx-display text-3xl sm:text-4xl text-[var(--nx-forest)] mb-4">
              Use the right food at the right time
            </h2>
            <p className="text-[var(--nx-stone)] text-lg leading-relaxed">
              Match storage and use to what you claimed so nutrients — and safety — hold up.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {USE_NOW.map((row, i) => (
              <li key={row.label} className="relative">
                <span className="nx-display text-5xl text-[var(--nx-sage)] leading-none block mb-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-bold text-[var(--nx-ink)] mb-2">{row.label}</h3>
                <p className="text-[var(--nx-stone)] leading-relaxed">{row.items}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="meals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 nx-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--nx-leaf)] mb-3">
              Ideas
            </p>
            <h2 className="nx-display text-3xl sm:text-4xl text-[var(--nx-forest)] mb-4">
              Meals from what shows up
            </h2>
            <p className="text-[var(--nx-stone)] text-lg leading-relaxed">
              Built from items that often appear on Food Maps and at local pantries.
            </p>
          </div>
          <div className="lg:col-span-8">
            {MEAL_IDEAS.map((meal, i) => (
              <article key={meal.name} className="nx-meal-row py-5 sm:py-6 flex gap-4 sm:gap-6">
                <span className="nx-display text-2xl text-[var(--nx-leaf)] w-10 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--nx-ink)] mb-1">{meal.name}</h3>
                  <p className="text-[var(--nx-stone)] leading-relaxed">{meal.bits}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dates" className="bg-[var(--nx-forest)] text-white nx-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-emerald-200/90 mb-3">
              Clarity
            </p>
            <h2 className="nx-display text-3xl sm:text-4xl mb-4">Date labels, simply</h2>
            <p className="text-emerald-50/85 text-lg leading-relaxed">
              Most dates are about quality, not an instant safety cliff. If food looks, smells, or feels off — skip it.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
            {DATE_GUIDE.map((row) => (
              <div key={row.label} className="border-t border-white/20 pt-5">
                <dt className="nx-display text-2xl mb-2">{row.label}</dt>
                <dd className="text-emerald-50/80 leading-relaxed">{row.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="families" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 nx-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--nx-leaf)] mb-3">
              Households
            </p>
            <blockquote className="nx-display text-3xl sm:text-4xl text-[var(--nx-forest)] leading-snug">
              {FAMILY_LINE}
            </blockquote>
          </div>
          <ul className="lg:col-span-5 space-y-4 text-[var(--nx-stone)] text-[17px] leading-relaxed">
            <li>Keep easy snacks ready: fruit, cheese, peanut butter on bread, yogurt.</li>
            <li>Check labels for allergies before sharing packaged or prepared food.</li>
            <li>Start with small plates; go back for seconds to cut waste.</li>
          </ul>
        </div>
      </section>

      <section className="nx-cta text-white nx-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="nx-display text-3xl sm:text-4xl mb-4">Put a better plate on the table tonight</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Browse live listings, or find pantries and meal sites near you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="index.html"
              className="inline-flex items-center justify-center bg-white text-[var(--nx-forest)] px-7 py-3.5 rounded-xl font-semibold hover:bg-[var(--nx-sage)] transition-colors"
            >
              Open Food Maps
            </a>
            <a
              href="providers.html"
              className="inline-flex items-center justify-center border border-white/45 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              See providers
            </a>
          </div>
          <p className="mt-10 text-xs text-white/50 max-w-md mx-auto leading-relaxed">
            General guidance for community food sharing — not medical advice. Ask a clinician or dietitian for personal needs.
          </p>
        </div>
      </section>
    </div>
  );
}

window.NutritionPage = NutritionPage;
