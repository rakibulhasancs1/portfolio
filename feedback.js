'use strict';
(() => {
  const section = document.querySelector('#feedback');
  if (!section) return;
  const api = String(window.FEEDBACK_API_BASE || '').replace(/\/$/, '');
  const form = section.querySelector('#feedback-form');
  const submitButton = section.querySelector('#feedback-submit');
  submitButton.setAttribute('aria-busy', 'false');
  const submitStatus = section.querySelector('#feedback-submit-status');
  const loadStatus = section.querySelector('#feedback-load-status');
  const list = section.querySelector('#feedback-list');
  const more = section.querySelector('#feedback-more');
  const retry = section.querySelector('#feedback-retry');
  const textarea = form.elements.message;
  let cursor = null;
  let pendingSubmission;
  let posting = false;
  const seen = new Set();
  const count = () => { section.querySelector('#feedback-character-count').textContent = `${textarea.value.length} / 1000`; };
  textarea.addEventListener('input', count);
  function status(element, message, state = '') { element.textContent = message; element.dataset.state = state; }
  async function request(path, options = {}, slowStatus) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const slow = slowStatus ? setTimeout(slowStatus, 8000) : null;
    try {
      const response = await fetch(api + path, { ...options, signal: controller.signal, credentials: 'omit', cache: 'no-store' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Feedback is temporarily unavailable. Please try again.');
      return body;
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('The feedback service is taking longer than expected. Please try again; your message is still here.');
      throw error;
    } finally { clearTimeout(timeout); if (slow) clearTimeout(slow); }
  }
  function node(tag, className, value) { const el = document.createElement(tag); if (className) el.className = className; if (value !== undefined) el.textContent = value; return el; }
  function addReview(review) {
    if (!review || typeof review.id !== 'string' || seen.has(review.id)) return;
    if (typeof review.name !== 'string' || typeof review.message !== 'string' || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) return;
    seen.add(review.id);
    const card = node('article', 'feedback-card');
    const top = node('div', 'feedback-card-top');
    const stars = node('span', 'feedback-stars', '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating));
    stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);
    top.append(stars);
    const date = new Date(review.createdAt);
    if (!Number.isNaN(date.getTime())) { const time = node('time', '', date.toLocaleDateString('en', { month: 'short', year: 'numeric' })); time.dateTime = date.toISOString(); top.append(time); }
    card.append(top, node('blockquote', '', review.message));
    const author = node('div', 'feedback-author');
    const initials = review.name.trim().split(/\s+/).slice(0, 2).map(s => Array.from(s)[0] || '').join('').toUpperCase();
    const avatar = node('span', 'feedback-avatar', initials); avatar.setAttribute('aria-hidden', 'true');
    const identity = node('div'); identity.append(node('strong', '', review.name));
    if (typeof review.company === 'string' && review.company.trim()) identity.append(node('p', '', review.company));
    author.append(avatar, identity); card.append(author); list.append(card);
  }
  async function loadFeedback(append = false) {
    list.setAttribute('aria-busy', 'true'); more.disabled = true; retry.hidden = true;
    status(loadStatus, 'Loading client feedback…');
    try {
      const data = await request('/api/feedback' + (append && cursor ? '?before=' + encodeURIComponent(cursor) : ''), {}, () => status(loadStatus, 'Still connecting to the feedback service. This may take a moment…'));
      if (!Array.isArray(data.feedback)) throw new Error('Unable to load feedback. Please try again.');
      if (!append) { list.replaceChildren(); seen.clear(); }
      data.feedback.forEach(addReview);
      cursor = typeof data.nextCursor === 'string' ? data.nextCursor : null;
      more.hidden = !cursor;
      if (!seen.size) {
        const empty = node('div', 'feedback-empty');
        empty.append(node('span', '', '✦'), node('h4', '', 'Your experience could be the first.'), node('p', '', 'Worked with me? Share an honest review using the form.'));
        list.replaceChildren(empty);
      }
      status(loadStatus, '');
    } catch (error) { status(loadStatus, error.message, 'error'); retry.hidden = false; }
    finally { list.setAttribute('aria-busy', 'false'); more.disabled = false; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (posting || !form.reportValidity()) return;
    if (!api) { status(submitStatus, 'Feedback is not available yet. Please connect with me through LinkedIn.', 'error'); return; }
    const values = { name: form.elements.name.value.trim(), company: form.elements.company.value.trim(), rating: Number(form.elements.rating.value), message: textarea.value.trim(), consent: form.elements.consent.checked, website: form.elements.website.value };
    const fingerprint = JSON.stringify(values);
    if (!pendingSubmission || pendingSubmission.fingerprint !== fingerprint) pendingSubmission = { fingerprint, submissionId: crypto.randomUUID() };
    posting = true; submitButton.disabled = true; submitButton.setAttribute('aria-busy', 'true'); submitButton.textContent = 'Publishing…'; status(submitStatus, 'Publishing your feedback…');
    try {
      const result = await request('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, submissionId: pendingSubmission.submissionId }) }, () => status(submitStatus, 'Still connecting. Please keep this page open; your message is safe here.'));
      status(submitStatus, result.message || 'Thank you! Your feedback is now published.', 'success');
      form.reset(); count(); pendingSubmission = undefined;
      void loadFeedback();
    } catch (error) { status(submitStatus, error.message, 'error'); }
    finally { posting = false; submitButton.disabled = false; submitButton.setAttribute('aria-busy', 'false'); submitButton.textContent = 'Publish feedback ↗'; }
  });
  more.addEventListener('click', () => loadFeedback(true)); retry.addEventListener('click', () => loadFeedback());
  if (api) loadFeedback();
  else {
    list.setAttribute('aria-busy', 'false');
    status(loadStatus, 'Client feedback is not available yet.');
    submitButton.disabled = true;
    submitButton.textContent = 'Feedback not available yet';
    submitButton.setAttribute('aria-describedby', 'feedback-submit-status');
    status(submitStatus, 'Feedback submission is not available yet. Please use LinkedIn to get in touch.');
  }
})();
