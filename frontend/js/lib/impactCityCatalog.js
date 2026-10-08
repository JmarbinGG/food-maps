/**
 * Repeatable city and story catalog for the Impact Story page.
 * Visitors switch cities and stories. Admins, in page edit mode, can add
 * as many cities and stories as they need. The catalog is stored as JSON
 * on the existing page-content record under __impact_catalog.
 */
(function (global) {
  'use strict';

  const CATALOG_KEY = '__impact_catalog';
  const VISIBLE_STORY_LIMIT = 3;
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1400&auto=format&fit=crop';

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 8);
  }

  function story(partial) {
    const src = partial || {};
    return {
      id: src.id || uid('story'),
      kicker: src.kicker || 'CITY STORY',
      image: src.image || FALLBACK_IMAGE,
      alt: src.alt || '',
      title: src.title || 'A local story',
      description: src.description || '',
      body: src.body || '',
      quote: src.quote || '',
      attribution: src.attribution || '',
      focus: Array.isArray(src.focus) ? src.focus.join(', ') : (src.focus || ''),
    };
  }

  function city(partial) {
    const src = partial || {};
    const stories = Array.isArray(src.stories) && src.stories.length
      ? src.stories.map(story)
      : [story({
          image: src.image,
          title: src.title,
          description: src.description,
          body: src.body,
          quote: src.quote,
          attribution: src.attribution,
          focus: src.focus,
        })];
    return {
      id: src.id || uid('city'),
      name: src.name || 'New city',
      region: src.region || 'California',
      meals: src.meals || '0',
      pounds: src.pounds || '0',
      partners: src.partners || '0',
      stories: stories,
    };
  }

  function defaultCatalog() {
    return {
      cities: [
        city({
          id: 'oakland',
          name: 'Oakland',
          meals: '3,840',
          pounds: '1,260',
          partners: '24',
          stories: [
            story({
              id: 'oakland-1',
              kicker: 'CITY STORY',
              image: FALLBACK_IMAGE,
              alt: 'Volunteers sorting food for an Oakland community distribution',
              title: 'Good food, close to home.',
              description: 'In Oakland, neighborhood markets and community groups can work together to move fresh food from a nearby pickup to the tables that need it.',
              body: 'In Oakland, neighborhood markets and community groups can work together to move fresh food from a nearby pickup to the tables that need it.\n\nVolunteers map the shortest handoff, so produce that is still good in the morning can reach a kitchen the same day. Neighbors who cannot cross town meet a pickup close to home, and the people who sorted the food can see exactly where it went. Markets, community groups, and volunteer drivers share one route instead of each solving the same problem alone.',
              quote: 'When a pickup is close by, more neighbors can lend a hand. The food stays in the community, and everyone feels part of making it happen.',
              attribution: 'Illustrative volunteer story - Oakland',
              focus: 'Neighborhood food partners, Community pickup points, Volunteer routes',
            }),
            story({
              id: 'oakland-2',
              kicker: 'VOLUNTEER STORY',
              image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1400&auto=format&fit=crop',
              alt: 'Crates of fresh produce ready for a volunteer pickup in Oakland',
              title: 'A route that fits a lunch break.',
              description: 'A short list of stops near work or home is enough for one volunteer to cover, so a market can hand off extra produce the same afternoon.',
              body: 'A short list of stops near work or home is enough for one volunteer to cover, so a market can hand off extra produce the same afternoon.\n\nThe list is short on purpose. Two or three stops within a few blocks of each other fit between the end of a shift and dinner, so helping does not cost a whole afternoon. A case of produce that would have sat overnight is sorted and out on a pantry table while it still looks the way it did at the market.',
              quote: 'I pick up two crates on my way home. It takes twenty minutes, and the pantry has them out before dinner.',
              attribution: 'Illustrative volunteer story - Oakland',
              focus: 'Short pickup routes, Same-day handoff, Flexible shifts',
            }),
            story({
              id: 'oakland-3',
              kicker: 'PARTNER STORY',
              image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1400&auto=format&fit=crop',
              alt: 'A neighborhood kitchen packing up food at the end of the day',
              title: 'Extra trays, put to use.',
              description: 'A corner restaurant can post what did not sell before closing, and a group a few blocks away can claim it while the food is still good.',
              body: 'A corner restaurant can post what did not sell before closing, and a group a few blocks away can claim it while the food is still good.\n\nClosing time is the deadline that matters. A kitchen that posts its last trays before the staff goes home gives a nearby group a clear window to collect, instead of a phone call the next morning when the food is already past use. The same trays that used to go in the bin can be an evening meal for a household that was not expecting one.',
              quote: 'We used to throw out the last trays. Now someone claims them before we lock up.',
              attribution: 'Illustrative partner story - Oakland',
              focus: 'Restaurant surplus, End-of-day posts, Nearby claims',
            }),
          ],
        }),
        city({
          id: 'alameda',
          name: 'Alameda',
          meals: '1,960',
          pounds: '680',
          partners: '13',
          stories: [
            story({
              id: 'alameda-1',
              kicker: 'CITY STORY',
              image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1400&auto=format&fit=crop',
              alt: 'Neighbors sharing groceries at a community table in Alameda',
              title: 'A little closer makes a difference.',
              description: 'Across Alameda, local food partners and volunteers can make pickups easier to reach and help fresh groceries find nearby homes.',
              body: 'Across Alameda, local food partners and volunteers can make pickups easier to reach and help fresh groceries find nearby homes.\n\nA pantry on one side of the island and a market on the other can share what they have without asking a family to make a long trip. Volunteers keep the handoff personal: a name, a time, and a bag of food that stays in the neighborhood. When the stop is close, more people can take part, and less fresh food sits unused.',
              quote: 'The best part is knowing the food is going to someone just down the street. It makes helping feel personal.',
              attribution: 'Illustrative community story - Alameda',
              focus: 'Local pantry connections, Island-wide pickup access, Volunteer handoffs',
            }),
            story({
              id: 'alameda-2',
              kicker: 'VOLUNTEER STORY',
              image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=1400&auto=format&fit=crop',
              alt: 'A volunteer loading grocery bags into a car in Alameda',
              title: 'Two stops on the way home.',
              description: 'Volunteers on the island can pair a grocery pickup with a drop at a pantry a few blocks on, without a drive across the bridge.',
              body: 'Volunteers on the island can pair a grocery pickup with a drop at a pantry a few blocks on, without a drive across the bridge.\n\nDistance is what usually stops someone from volunteering twice. Here a grocery pickup and a pantry drop can sit within the same few blocks, so the trip costs a detour rather than an evening. People who could not commit to a route across the bridge end up helping most weeks.',
              quote: 'Everything is close here. I can do a pickup and a drop-off and still be home for dinner.',
              attribution: 'Illustrative volunteer story - Alameda',
              focus: 'Short island routes, Grocery pickups, Neighborhood drop-offs',
            }),
            story({
              id: 'alameda-3',
              kicker: 'PARTNER STORY',
              image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1400&auto=format&fit=crop',
              alt: 'A small market setting aside prepared food for donation',
              title: 'A shelf that stays stocked.',
              description: 'A small market can post what did not sell that week, and a community fridge nearby can keep something on the shelf most days.',
              body: 'A small market can post what did not sell that week, and a community fridge nearby can keep something on the shelf most days.\n\nA fridge that is empty half the time stops being worth the walk. When a market posts its surplus on a schedule, the people who pass the fridge on their way to work learn they can count on it. Small, regular drops keep the shelf stocked better than one large donation that disappears in an afternoon.',
              quote: 'People check the fridge on their way past. If there is food in it, it gets used.',
              attribution: 'Illustrative partner story - Alameda',
              focus: 'Community fridge, Weekly surplus, Steady restocking',
            }),
          ],
        }),
        city({
          id: 'berkeley',
          name: 'Berkeley',
          meals: '2,710',
          pounds: '940',
          partners: '18',
          stories: [
            story({
              id: 'berkeley-1',
              kicker: 'CITY STORY',
              image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1400&auto=format&fit=crop',
              alt: 'A shared community meal being set out in Berkeley',
              title: 'Shared tables, stronger blocks.',
              description: 'In Berkeley, neighborhood organizations can coordinate surplus food with community fridges, meal programs, and nearby families.',
              body: 'In Berkeley, neighborhood organizations can coordinate surplus food with community fridges, meal programs, and nearby families.\n\nA campus kitchen, a community fridge, and a block meal can all draw from the same surplus instead of competing for it. Partners post what they have, and a nearby group claims it before it is overlooked. The story of the food stays local: who cooked it, who carried it, and which table it landed on.',
              quote: 'When local groups share what they have, fewer good ingredients get overlooked and more people can take part.',
              attribution: 'Illustrative partner story - Berkeley',
              focus: 'Community meal programs, Shared food access, Local partner network',
            }),
            story({
              id: 'berkeley-2',
              kicker: 'VOLUNTEER STORY',
              image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1400&auto=format&fit=crop',
              alt: 'A student volunteer carrying a box of produce between classes',
              title: 'Students with an afternoon free.',
              description: 'Volunteers with a few open hours between classes can cover the weekday pickups that would otherwise be missed.',
              body: 'Volunteers with a few open hours between classes can cover the weekday pickups that would otherwise be missed.\n\nWeekday afternoons are the hardest slots to fill, because most volunteers are at work. A student with two free hours can take a run that would otherwise be skipped, and the pickup stays on the schedule instead of being dropped for the week. Over a term, the same few open afternoons add up to a route partners can plan around.',
              quote: 'Between classes I have two hours. That is enough to move a load of produce across town.',
              attribution: 'Illustrative volunteer story - Berkeley',
              focus: 'Weekday coverage, Campus volunteers, Produce runs',
            }),
            story({
              id: 'berkeley-3',
              kicker: 'PARTNER STORY',
              image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1400&auto=format&fit=crop',
              alt: 'Farmers market vendors packing up produce at closing time',
              title: 'From the market stall to the meal program.',
              description: 'Market vendors can pass along what is left at closing, and a meal program down the road can cook with it the next morning.',
              body: 'Market vendors can pass along what is left at closing, and a meal program down the road can cook with it the next morning.\n\nWhat is left at a stall is usually food that is good but no longer sellable: the bruised half of a crate, the last of the greens. A meal program can cook with exactly that, as long as it arrives the same day. Vendors hand it over as they pack up, and it is on the stove the next morning.',
              quote: 'Whatever is left at the end of market goes into the pot instead of the bin.',
              attribution: 'Illustrative partner story - Berkeley',
              focus: 'Farmers market surplus, Meal programs, Next-day cooking',
            }),
          ],
        }),
        city({
          id: 'san-leandro',
          name: 'San Leandro',
          meals: '2,180',
          pounds: '760',
          partners: '15',
          stories: [
            story({
              id: 'san-leandro-1',
              kicker: 'CITY STORY',
              image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1400&auto=format&fit=crop',
              alt: 'Boxes of rescued groceries staged for pickup in San Leandro',
              title: 'Fresh food finds its next stop.',
              description: 'San Leandro partners can connect grocery and restaurant surplus with local pickup points through simple, coordinated volunteer routes.',
              body: 'San Leandro partners can connect grocery and restaurant surplus with local pickup points through simple, coordinated volunteer routes.\n\nA clear window for pickup means a volunteer can collect from a grocer and reach a pantry without guessing the timing. Restaurant surplus that would have closed with the kitchen can be on its way while it is still fresh. The route is short on purpose, so the time goes to the food and the people waiting for it.',
              quote: 'A clear pickup plan gives our volunteers more time to focus on the people and the food, not the logistics.',
              attribution: 'Illustrative volunteer story - San Leandro',
              focus: 'Rescue and redistribution, Convenient pickup windows, Volunteer coordination',
            }),
            story({
              id: 'san-leandro-2',
              kicker: 'VOLUNTEER STORY',
              image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1400&auto=format&fit=crop',
              alt: 'A volunteer driver checking a pickup list before setting out',
              title: 'One driver, a few stops.',
              description: 'A single volunteer with a car can link two or three pickups into one loop, so the smaller donations still get collected.',
              body: 'A single volunteer with a car can link two or three pickups into one loop, so the smaller donations still get collected.\n\nSmall donations are the ones that get skipped, because no single pickup justifies the trip. Grouping two or three into one loop makes the drive worth it, and a grocer with one crate is no longer too small to bother with. A driver with a planned order of stops can cover a side of town in about an hour.',
              quote: 'On my own I can only carry so much. A planned loop means nothing gets left behind.',
              attribution: 'Illustrative volunteer story - San Leandro',
              focus: 'Planned loops, Small-batch pickups, Driver coordination',
            }),
            story({
              id: 'san-leandro-3',
              kicker: 'PARTNER STORY',
              image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1400&auto=format&fit=crop',
              alt: 'Unsold bread and pastries boxed up at a bakery counter',
              title: 'A bakery closes out its day.',
              description: 'A bakery can post the unsold loaves before closing so a group nearby can collect them while the bread is still fresh.',
              body: 'A bakery can post the unsold loaves before closing so a group nearby can collect them while the bread is still fresh.\n\nBread has a shorter window than almost anything else a kitchen donates. A loaf collected the night it was baked goes out as bread; the same loaf two days later goes out as crumbs, or not at all. Posting before closing is what keeps the handoff inside that window.',
              quote: 'Bread does not keep. Getting it out the door the same night is the whole thing.',
              attribution: 'Illustrative partner story - San Leandro',
              focus: 'Bakery donations, Same-night pickup, Short distances',
            }),
          ],
        }),
      ],
    };
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function plain(value) {
    return String(value || '').replace(/<[^>]*>/g, '').trim();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeCatalog(raw) {
    if (!raw || !Array.isArray(raw.cities) || !raw.cities.length) return null;
    const cities = raw.cities.map(city).filter((item) => item.name);
    return cities.length ? { cities: cities } : null;
  }

  function parseStored(value) {
    if (!value) return null;
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return normalizeCatalog(parsed);
    } catch (_) {
      return null;
    }
  }

  function fullStoryText(item) {
    if (!item) return '';
    const body = String(item.body || '').trim();
    const excerpt = String(item.description || '').trim();
    if (!body || body === excerpt) return '';
    return body;
  }

  function focusParts(value) {
    return String(value || '')
      .split(/[,·|]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function shortRegion(region) {
    if (!region) return '';
    return String(region).toLowerCase() === 'california' ? 'CA' : region;
  }

  function storyMarkup(item, index, total, selected, editing) {
    const region = selected.region ? ', ' + escapeHtml(selected.region.toUpperCase()) : '';
    const place = escapeHtml(selected.name) + (selected.region ? ', ' + escapeHtml(shortRegion(selected.region)) : '');
    const parts = focusParts(item.focus);
    const alt = item.alt || ('Community food distribution in ' + selected.name);
    const full = fullStoryText(item);
    const expanded = Boolean(full) && expandedStories.has(item.id);
    return ''
      + '<article class="city-story-row'
      + (expanded ? ' is-expanded' : '')
      + (editing && item.id === storyId ? ' is-editing' : '') + '">'
      + '<div class="city-photo-wrap">'
      + '<img src="' + escapeHtml(item.image || FALLBACK_IMAGE) + '" alt="' + escapeHtml(alt) + '">'
      + '<span class="photo-label"><i class="icon-map-pin" aria-hidden="true"></i> ' + place + '</span>'
      + '</div>'
      + '<div class="city-story">'
      + '<p class="section-kicker"><i class="icon-map-pin" aria-hidden="true"></i> '
      + escapeHtml(selected.name.toUpperCase()) + region
      + ' <span class="story-dot"></span> ' + escapeHtml(item.kicker || 'CITY STORY')
      + ' <span class="story-count">STORY ' + (index + 1) + ' OF ' + total + '</span></p>'
      + '<h3>' + escapeHtml(item.title) + '</h3>'
      + '<p class="city-description' + (expanded ? ' is-full' : '') + '">'
      + escapeHtml(expanded ? full : item.description) + '</p>'
      + (full
        ? '<button type="button" class="city-story-more" data-story="' + escapeHtml(item.id)
          + '" aria-expanded="' + (expanded ? 'true' : 'false') + '">'
          + (expanded ? 'Show less' : 'Read the full story') + '</button>'
        : '')
      + '<blockquote><span class="quote-mark" aria-hidden="true">“</span>'
      + '<p>' + escapeHtml(item.quote) + '</p>'
      + '<cite>' + escapeHtml(item.attribution) + '</cite></blockquote>'
      + '<div class="city-neighborhoods"><span>COMMUNITY FOCUS</span>'
      + '<p>' + parts.map(escapeHtml).join(' <b>·</b> ') + '</p></div>'
      + '</div></article>';
  }

  function storiesToggleMarkup(selected, hidden) {
    const label = hidden > 0
      ? 'Show ' + hidden + ' more ' + escapeHtml(selected.name) + (hidden === 1 ? ' story' : ' stories')
      : 'Show fewer stories';
    return '<div class="city-stories-toggle">'
      + '<button type="button" class="city-stories-more" aria-expanded="' + (hidden > 0 ? 'false' : 'true') + '">'
      + label + '</button></div>';
  }

  function authToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
  }

  let pageId = 'impactStory';
  let catalog = defaultCatalog();
  let savedSnapshot = clone(catalog);
  let cityId = catalog.cities[0].id;
  let storyId = catalog.cities[0].stories[0].id;
  const expandedStories = new Set();
  let showAllStories = false;
  let dirty = false;
  let wasEditing = false;
  let formReady = false;

  function currentCity() {
    return catalog.cities.find((item) => item.id === cityId) || catalog.cities[0];
  }

  function currentStory() {
    const selected = currentCity();
    if (!selected) return null;
    return selected.stories.find((item) => item.id === storyId) || selected.stories[0];
  }

  function select(nextCityId, nextStoryId) {
    const selected = catalog.cities.find((item) => item.id === nextCityId) || catalog.cities[0];
    if (!selected) return;
    cityId = selected.id;
    const storyMatch = selected.stories.find((item) => item.id === nextStoryId);
    storyId = (storyMatch || selected.stories[0]).id;
    expandedStories.clear();
    showAllStories = false;
    renderPublic();
    syncForm();
  }

  function renderPublic() {
    const tabs = document.getElementById('city-tabs');
    const nav = document.getElementById('city-story-nav');
    const selected = currentCity();
    const activeStory = currentStory();
    if (!tabs || !selected || !activeStory) return;

    const editing = document.body.classList.contains('edit-mode');
    tabs.innerHTML = '';
    catalog.cities.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'city-tab' + (item.id === selected.id ? ' is-active' : '');
      button.id = 'city-tab-' + item.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', item.id === selected.id ? 'true' : 'false');
      button.setAttribute('aria-controls', 'city-panel');
      button.tabIndex = item.id === selected.id ? 0 : -1;
      button.dataset.city = item.id;
      button.textContent = item.name;
      button.addEventListener('click', () => select(item.id));
      button.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % catalog.cities.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + catalog.cities.length) % catalog.cities.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = catalog.cities.length - 1;
        else return;
        event.preventDefault();
        select(catalog.cities[next].id);
        const nextTab = document.getElementById('city-tab-' + catalog.cities[next].id);
        if (nextTab) nextTab.focus();
      });
      tabs.appendChild(button);
    });

    const panel = document.getElementById('city-panel');
    if (panel) panel.setAttribute('aria-labelledby', 'city-tab-' + selected.id);

    if (nav) {
      // Visitors see every story in the tab, so the chips are only the admin's
      // picker for which story the form below edits.
      nav.innerHTML = '';
      nav.hidden = !editing;
      if (editing) {
        selected.stories.forEach((item, index) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'city-story-chip' + (item.id === activeStory.id ? ' is-active' : '');
          chip.textContent = item.title ? item.title : ('Story ' + (index + 1));
          chip.addEventListener('click', () => select(selected.id, item.id));
          nav.appendChild(chip);
        });
      }
    }

    if (panel) {
      const total = selected.stories.length;
      const shown = (editing || showAllStories)
        ? selected.stories
        : selected.stories.slice(0, VISIBLE_STORY_LIMIT);
      const hidden = total - shown.length;
      let markup = shown
        .map((item, index) => storyMarkup(item, index, total, selected, editing))
        .join('');
      if (!editing && (hidden > 0 || total > VISIBLE_STORY_LIMIT)) {
        markup += storiesToggleMarkup(selected, hidden);
      }
      panel.innerHTML = markup;
    }

  }

  function field(id, label, value, options) {
    const opts = options || {};
    const wrap = document.createElement('label');
    if (opts.wide) wrap.className = 'span-2';
    wrap.textContent = label;
    const input = opts.multiline ? document.createElement('textarea') : document.createElement('input');
    if (!opts.multiline) input.type = 'text';
    input.id = id;
    input.value = value || '';
    input.addEventListener('input', () => {
      readFormIntoModel();
      dirty = true;
      renderPublic();
    });
    wrap.appendChild(input);
    return wrap;
  }

  function mountAdmin() {
    const root = document.getElementById('impact-city-admin');
    if (!root || formReady) return;
    formReady = true;
    root.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = 'Cities and stories';
    const note = document.createElement('p');
    note.textContent = 'Add a city, then add as many stories as you need in that city. Save stories here. The side panel still saves the rest of the page.';
    root.appendChild(heading);
    root.appendChild(note);

    const grid = document.createElement('div');
    grid.className = 'impact-city-admin__grid';
    const selected = currentCity();
    const activeStory = currentStory();
    [
      ['impact-city-name', 'City', selected && selected.name],
      ['impact-city-region', 'Region', selected && selected.region],
      ['impact-new-city', 'New city name', ''],
    ].forEach((item) => grid.appendChild(field(item[0], item[1], item[2])));
    const singleLineStoryFields = [
      'impact-story-title',
      'impact-story-kicker',
      'impact-story-image',
      'impact-story-attribution',
      'impact-story-focus',
    ];
    [
      ['impact-story-title', 'Story title', activeStory && activeStory.title],
      ['impact-story-kicker', 'Story label, shown above the title', activeStory && activeStory.kicker],
      ['impact-story-image', 'Story photo URL', activeStory && activeStory.image],
      ['impact-story-description', 'Excerpt', activeStory && activeStory.description],
      ['impact-story-body', 'Full story', activeStory && activeStory.body],
      ['impact-story-quote', 'Quote', activeStory && activeStory.quote],
      ['impact-story-attribution', 'Attribution', activeStory && activeStory.attribution],
      ['impact-story-focus', 'Focus points, separated by commas', activeStory && activeStory.focus],
    ].forEach((item) => grid.appendChild(field(item[0], item[1], item[2], {
      wide: true,
      multiline: singleLineStoryFields.indexOf(item[0]) === -1,
    })));
    root.appendChild(grid);

    const actions = document.createElement('div');
    actions.className = 'impact-city-admin__actions';
    actions.appendChild(action('Add city', 'is-muted', addCity));
    actions.appendChild(action('Add story', 'is-muted', addStory));
    actions.appendChild(action('Remove story', 'is-danger', removeStory));
    actions.appendChild(action('Remove city', 'is-danger', removeCity));
    actions.appendChild(action('Save stories', 'is-primary', saveCatalog));
    root.appendChild(actions);

    const status = document.createElement('p');
    status.id = 'impact-city-status';
    status.className = 'impact-city-admin__status';
    root.appendChild(status);
    syncForm();
  }

  function action(label, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  function inputValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setInput(id, value) {
    const el = document.getElementById(id);
    if (!el || document.activeElement === el) return;
    el.value = value || '';
  }

  function readFormIntoModel() {
    const selected = currentCity();
    const activeStory = currentStory();
    if (!selected || !activeStory || !formReady) return;
    selected.name = plain(inputValue('impact-city-name')) || selected.name;
    selected.region = plain(inputValue('impact-city-region'));
    activeStory.title = plain(inputValue('impact-story-title'));
    activeStory.kicker = plain(inputValue('impact-story-kicker')) || 'CITY STORY';
    activeStory.image = plain(inputValue('impact-story-image')) || FALLBACK_IMAGE;
    activeStory.description = plain(inputValue('impact-story-description'));
    activeStory.body = plain(inputValue('impact-story-body'));
    activeStory.quote = plain(inputValue('impact-story-quote'));
    activeStory.attribution = plain(inputValue('impact-story-attribution'));
    activeStory.focus = plain(inputValue('impact-story-focus'));
  }

  function syncForm() {
    const selected = currentCity();
    const activeStory = currentStory();
    if (!selected || !activeStory || !formReady) return;
    setInput('impact-city-name', selected.name);
    setInput('impact-city-region', selected.region);
    setInput('impact-story-title', activeStory.title);
    setInput('impact-story-kicker', activeStory.kicker);
    setInput('impact-story-image', activeStory.image);
    setInput('impact-story-description', activeStory.description);
    setInput('impact-story-body', activeStory.body);
    setInput('impact-story-quote', activeStory.quote);
    setInput('impact-story-attribution', activeStory.attribution);
    setInput('impact-story-focus', activeStory.focus);
  }

  function setStatus(message) {
    const status = document.getElementById('impact-city-status');
    if (status) status.textContent = message || '';
  }

  function addCity() {
    const name = plain(inputValue('impact-new-city'));
    if (!name) {
      setStatus('Enter a new city name first.');
      return;
    }
    readFormIntoModel();
    const created = city({ name: name, stories: [story({ title: 'New story in ' + name })] });
    catalog.cities.push(created);
    const box = document.getElementById('impact-new-city');
    if (box) box.value = '';
    dirty = true;
    select(created.id, created.stories[0].id);
    setStatus('Added ' + name + '. Save stories to keep it.');
  }

  function addStory() {
    const selected = currentCity();
    if (!selected) return;
    readFormIntoModel();
    const created = story({ title: 'Story ' + (selected.stories.length + 1) + ' in ' + selected.name });
    selected.stories.push(created);
    dirty = true;
    select(selected.id, created.id);
    setStatus('Added a story. Save stories to keep it.');
  }

  function removeStory() {
    const selected = currentCity();
    const activeStory = currentStory();
    if (!selected || !activeStory) return;
    if (selected.stories.length <= 1) {
      setStatus('A city needs at least one story. Remove the city instead.');
      return;
    }
    if (!global.confirm('Remove this story from ' + selected.name + '?')) return;
    selected.stories = selected.stories.filter((item) => item.id !== activeStory.id);
    dirty = true;
    select(selected.id, selected.stories[0].id);
    setStatus('Story removed. Save stories to keep this change.');
  }

  function removeCity() {
    const selected = currentCity();
    if (!selected) return;
    if (catalog.cities.length <= 1) {
      setStatus('Keep at least one city.');
      return;
    }
    if (!global.confirm('Remove ' + selected.name + ' and all of its stories?')) return;
    catalog.cities = catalog.cities.filter((item) => item.id !== selected.id);
    dirty = true;
    select(catalog.cities[0].id, catalog.cities[0].stories[0].id);
    setStatus('City removed. Save stories to keep this change.');
  }

  async function saveCatalog() {
    readFormIntoModel();
    const token = authToken();
    if (!token) {
      setStatus('Sign in as an admin to save.');
      return;
    }
    setStatus('Saving stories…');
    try {
      const res = await fetch('/api/pages/' + encodeURIComponent(pageId) + '/content', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ content: { [CATALOG_KEY]: JSON.stringify(catalog) } }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || ('Save failed (' + res.status + ')'));
      }
      const data = await res.json();
      const stored = parseStored(data.content && data.content[CATALOG_KEY]);
      if (stored) catalog = stored;
      savedSnapshot = clone(catalog);
      dirty = false;
      renderPublic();
      syncForm();
      setStatus('Cities and stories saved.');
    } catch (err) {
      setStatus(err.message || 'Could not save stories.');
    }
  }

  async function loadCatalog() {
    try {
      const res = await fetch('/api/pages/' + encodeURIComponent(pageId) + '/content', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      const stored = parseStored(data.content && data.content[CATALOG_KEY]);
      if (stored) {
        catalog = stored;
        savedSnapshot = clone(catalog);
        cityId = catalog.cities[0].id;
        storyId = catalog.cities[0].stories[0].id;
      }
    } catch (_) { /* keep the built-in cities */ }
    renderPublic();
    syncForm();
  }

  function watchEditMode() {
    const observer = new MutationObserver(() => {
      const editing = document.body.classList.contains('edit-mode');
      if (editing && !wasEditing) {
        savedSnapshot = clone(catalog);
        dirty = false;
        mountAdmin();
        syncForm();
      }
      if (!editing && wasEditing && dirty) {
        catalog = clone(savedSnapshot);
        cityId = catalog.cities[0].id;
        storyId = catalog.cities[0].stories[0].id;
        dirty = false;
        renderPublic();
        syncForm();
        setStatus('');
      }
      if (editing) renderPublic();
      wasEditing = editing;
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function bindStoryExpand() {
    const panel = document.getElementById('city-panel');
    if (!panel || panel.dataset.expandBound) return;
    panel.dataset.expandBound = 'true';

    panel.addEventListener('click', (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== 'function') return;

      if (target.closest('.city-stories-more')) {
        showAllStories = !showAllStories;
        renderPublic();
        const again = panel.querySelector('.city-stories-more');
        if (again) again.focus();
        return;
      }

      const toggle = target.closest('.city-story-more');
      if (!toggle) return;
      const id = toggle.dataset.story;
      if (expandedStories.has(id)) expandedStories.delete(id);
      else expandedStories.add(id);
      renderPublic();
      // The row is rebuilt, so hand focus back to the button that replaced it.
      const moved = panel.querySelector('.city-story-more[data-story="' + id + '"]');
      if (moved) moved.focus();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !expandedStories.size) return;
      expandedStories.clear();
      renderPublic();
    });
  }

  async function init(options) {
    pageId = (options && options.pageId) || 'impactStory';
    bindStoryExpand();
    mountAdmin();
    watchEditMode();
    await loadCatalog();
  }

  global.FoodMapsImpactCatalog = {
    init: init,
    getCatalog: function () { return catalog; },
  };
})(window);
