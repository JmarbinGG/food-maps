/**
 * Shared newsletter signup wiring for static pages.
 * Expects a form with optional [name=firstName], [name=lastName],
 * required [name=email], and optional [name=consent] checkbox.
 */
(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setMsg(el, visible, html) {
    if (!el) return;
    if (html != null) el.innerHTML = html;
    el.classList.toggle('hidden', !visible);
  }

  async function subscribe(payload) {
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let data = {};
    try {
      data = await res.json();
    } catch (_) { /* ignore */ }
    if (!res.ok) {
      const detail = data.detail;
      const msg = typeof detail === 'string'
        ? detail
        : (Array.isArray(detail) && detail[0]?.msg) || data.message || 'Something went wrong. Please try again.';
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function bindNewsletterForm(form, options = {}) {
    if (!form || form.dataset.newsletterBound === '1') return;
    form.dataset.newsletterBound = '1';

    const source = options.source || form.dataset.source || 'website';
    const successEl = options.successEl
      || (form.querySelector('[data-newsletter-success]') || document.getElementById(options.successId || 'newsletterSuccess'));
    const errorEl = options.errorEl
      || (form.querySelector('[data-newsletter-error]') || document.getElementById(options.errorId || 'newsletterError'));
    const submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setMsg(successEl, false);
      setMsg(errorEl, false);

      const firstName = (form.querySelector('[name="firstName"]')?.value || '').trim();
      const lastName = (form.querySelector('[name="lastName"]')?.value || '').trim();
      const email = (form.querySelector('[name="email"]')?.value || '').trim();
      const consentEl = form.querySelector('[name="consent"]');

      if (!EMAIL_RE.test(email)) {
        setMsg(errorEl, true, '<strong>Error!</strong> Please enter a valid email address.');
        return;
      }
      if (consentEl && !consentEl.checked) {
        setMsg(errorEl, true, '<strong>Error!</strong> Please agree to receive updates before subscribing.');
        return;
      }

      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing…';
      }

      try {
        const data = await subscribe({
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          source,
        });
        setMsg(
          successEl,
          true,
          `<strong>Success!</strong> ${data.message || "You're subscribed to our newsletter."}`
        );
        form.reset();
        if (options.onSuccess) options.onSuccess(data);
      } catch (err) {
        setMsg(errorEl, true, `<strong>Error!</strong> ${err.message || 'Something went wrong. Please try again.'}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  }

  function autoBind() {
    document.querySelectorAll('form[data-newsletter-form]').forEach((form) => {
      bindNewsletterForm(form, { source: form.dataset.source });
    });
  }

  window.FoodMapsNewsletter = {
    subscribe,
    bindNewsletterForm,
    autoBind,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBind);
  } else {
    autoBind();
  }
})();
