/**
 * Repeatable city and story catalog for the Impact Story page.
 * Visitors switch cities and stories. Admins, in page edit mode, can add
 * as many cities and stories as they need. The catalog is stored as JSON
 * on the existing page-content record under __impact_catalog.
 */
(function (global) {
  'use strict';

  const CATALOG_KEY = '__impact_catalog';
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1400&auto=format&fit=crop';

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 8);
  }

  function story(partial) {
    const src = partial || {};
    return {
      id: src.id || uid('story'),
      image: src.image || FALLBACK_IMAGE,
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
          stories: [story({
            id: 'oakland-1',
            image: FALLBACK_IMAGE,
            title: 'Good food, close to home.',
            description: 'In Oakland, neighborhood markets and community groups can work together to move fresh food from a nearby pickup to the tables that need it.',
            body: 'In Oakland, neighborhood markets and community groups can work together to move fresh food from a nearby pickup to the tables that need it.\n\nVolunteers map the shortest handoff, so produce that is still good in the morning can reach a kitchen the same day. Neighbors who cannot cross town meet a pickup close to home, and the people who sorted the food can see exactly where it went. Markets, community groups, and volunteer drivers share one route instead of each solving the same problem alone.',
            quote: 'When a pickup is close by, more neighbors can lend a hand. The food stays in the community, and everyone feels part of making it happen.',
            attribution: 'Illustrative volunteer story - Oakland',
            focus: 'Neighborhood food partners, Community pickup points, Volunteer routes',
          })],
        }),
        city({
          id: 'alameda',
          name: 'Alameda',
          meals: '1,960',
          pounds: '680',
          partners: '13',
          stories: [story({
            id: 'alameda-1',
            image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1400&auto=format&fit=crop',
            title: 'A little closer makes a difference.',
            description: 'Across Alameda, local food partners and volunteers can make pickups easier to reach and help fresh groceries find nearby homes.',
            body: 'Across Alameda, local food partners and volunteers can make pickups easier to reach and help fresh groceries find nearby homes.\n\nA pantry on one side of the island and a market on the other can share what they have without asking a family to make a long trip. Volunteers keep the handoff personal: a name, a time, and a bag of food that stays in the neighborhood. When the stop is close, more people can take part, and less fresh food sits unused.',
            quote: 'The best part is knowing the food is going to someone just down the street. It makes helping feel personal.',
            attribution: 'Illustrative community story - Alameda',
            focus: 'Local pantry connections, Island-wide pickup access, Volunteer handoffs',
          })],
        }),
        city({
          id: 'berkeley',
          name: 'Berkeley',
          meals: '2,710',
          pounds: '940',
          partners: '18',
          stories: [story({
            id: 'berkeley-1',
            image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1400&auto=format&fit=crop',
            title: 'Shared tables, stronger blocks.',
            description: 'In Berkeley, neighborhood organizations can coordinate surplus food with community fridges, meal programs, and nearby families.',
            body: 'In Berkeley, neighborhood organizations can coordinate surplus food with community fridges, meal programs, and nearby families.\n\nA campus kitchen, a community fridge, and a block meal can all draw from the same surplus instead of competing for it. Partners post what they have, and a nearby group claims it before it is overlooked. The story of the food stays local: who cooked it, who carried it, and which table it landed on.',
            quote: 'When local groups share what they have, fewer good ingredients get overlooked and more people can take part.',
            attribution: 'Illustrative partner story - Berkeley',
            focus: 'Community meal programs, Shared food access, Local partner network',
          })],
        }),
        city({
          id: 'san-leandro',
          name: 'San Leandro',
          meals: '2,180',
          pounds: '760',
          partners: '15',
          stories: [story({
            id: 'san-leandro-1',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1400&auto=format&fit=crop',
            title: 'Fresh food finds its next stop.',
            description: 'San Leandro partners can connect grocery and restaurant surplus with local pickup points through simple, coordinated volunteer routes.',
            body: 'San Leandro partners can connect grocery and restaurant surplus with local pickup points through simple, coordinated volunteer routes.\n\nA clear window for pickup means a volunteer can collect from a grocer and reach a pantry without guessing the timing. Restaurant surplus that would have closed with the kitchen can be on its way while it is still fresh. The route is short on purpose, so the time goes to the food and the people waiting for it.',
            quote: 'A clear pickup plan gives our volunteers more time to focus on the people and the food, not the logistics.',
            attribution: 'Illustrative volunteer story - San Leandro',
            focus: 'Rescue and redistribution, Convenient pickup windows, Volunteer coordination',
          })],
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

  function authToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
  }

  let pageId = 'impactStory';
  let catalog = defaultCatalog();
  let savedSnapshot = clone(catalog);
  let cityId = catalog.cities[0].id;
  let storyId = catalog.cities[0].stories[0].id;
  let storyExpanded = false;
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
    storyExpanded = false;
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
    const full = fullStoryText(activeStory);
    const expanded = storyExpanded && Boolean(full);
    if (panel) {
      panel.setAttribute('aria-labelledby', 'city-tab-' + selected.id);
      panel.classList.toggle('is-expandable', Boolean(full));
      panel.classList.toggle('is-expanded', expanded);
      if (full) panel.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      else panel.removeAttribute('aria-expanded');
    }

    if (nav) {
      nav.innerHTML = '';
      const showStories = selected.stories.length > 1 || editing;
      nav.hidden = !showStories;
      if (showStories) {
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

    const photo = document.getElementById('city-photo');
    if (photo) {
      photo.src = activeStory.image || FALLBACK_IMAGE;
      photo.alt = 'Community food distribution in ' + selected.name;
    }
    const photoCity = document.getElementById('photo-city');
    const photoRegion = document.getElementById('photo-region');
    if (photoCity) photoCity.textContent = selected.name;
    if (photoRegion) photoRegion.textContent = selected.region ? ', ' + selected.region : '';

    const eyebrow = document.getElementById('city-eyebrow');
    if (eyebrow) {
      eyebrow.innerHTML = escapeHtml(selected.name.toUpperCase())
        + (selected.region ? ', ' + escapeHtml(selected.region.toUpperCase()) : '')
        + ' <span class="story-dot"></span> CITY STORY';
    }
    const title = document.getElementById('city-title');
    if (title) title.textContent = activeStory.title;
    const description = document.getElementById('city-description');
    if (description) {
      description.textContent = expanded ? full : activeStory.description;
      description.classList.toggle('is-full', expanded);
    }
    const more = document.getElementById('city-story-more');
    if (more) more.textContent = expanded ? 'Show less' : 'Read the full story';
    const quote = document.getElementById('city-quote');
    if (quote) quote.textContent = activeStory.quote;
    const attribution = document.getElementById('city-attribution');
    if (attribution) attribution.textContent = activeStory.attribution;
    const focus = document.getElementById('city-focus');
    if (focus) {
      const parts = focusParts(activeStory.focus);
      focus.innerHTML = parts.map(escapeHtml).join(' <b>·</b> ');
    }
    const meals = document.getElementById('metric-meals');
    const pounds = document.getElementById('metric-food');
    const partners = document.getElementById('metric-partners');
    const period = document.getElementById('metric-period');
    if (meals) meals.textContent = selected.meals;
    if (pounds) pounds.textContent = selected.pounds;
    if (partners) partners.textContent = selected.partners;
    if (period) period.textContent = 'Illustrative 12-month snapshot for ' + selected.name;
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
      ['impact-metric-meals', 'Meals shared', selected && selected.meals],
      ['impact-metric-pounds', 'Food rescued (lb)', selected && selected.pounds],
      ['impact-metric-partners', 'Community partners', selected && selected.partners],
      ['impact-new-city', 'New city name', ''],
    ].forEach((item) => grid.appendChild(field(item[0], item[1], item[2])));
    [
      ['impact-story-title', 'Story title', activeStory && activeStory.title],
      ['impact-story-image', 'Story photo URL', activeStory && activeStory.image],
      ['impact-story-description', 'Excerpt', activeStory && activeStory.description],
      ['impact-story-body', 'Full story', activeStory && activeStory.body],
      ['impact-story-quote', 'Quote', activeStory && activeStory.quote],
      ['impact-story-attribution', 'Attribution', activeStory && activeStory.attribution],
      ['impact-story-focus', 'Focus points, separated by commas', activeStory && activeStory.focus],
    ].forEach((item) => grid.appendChild(field(item[0], item[1], item[2], { wide: true, multiline: item[0] !== 'impact-story-title' && item[0] !== 'impact-story-image' && item[0] !== 'impact-story-attribution' && item[0] !== 'impact-story-focus' })));
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
    selected.meals = plain(inputValue('impact-metric-meals'));
    selected.pounds = plain(inputValue('impact-metric-pounds'));
    selected.partners = plain(inputValue('impact-metric-partners'));
    activeStory.title = plain(inputValue('impact-story-title'));
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
    setInput('impact-metric-meals', selected.meals);
    setInput('impact-metric-pounds', selected.pounds);
    setInput('impact-metric-partners', selected.partners);
    setInput('impact-story-title', activeStory.title);
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

    function toggleStory() {
      if (!fullStoryText(currentStory())) return;
      storyExpanded = !storyExpanded;
      renderPublic();
    }

    panel.addEventListener('click', toggleStory);
    panel.addEventListener('keydown', (event) => {
      if (event.target !== panel) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleStory();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !storyExpanded) return;
      storyExpanded = false;
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
