'use strict';
const themeButton = document.querySelector('.theme-toggle');
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeButton.setAttribute('aria-pressed', String(!dark));
  themeButton.querySelector('.theme-icon').textContent = dark ? '☀' : '☾';
  themeButton.querySelector('.theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#101615' : '#f7f9f5';
}
updateThemeButton();
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('portfolio-theme', next); } catch (error) { /* Theme works when storage is unavailable. */ }
  updateThemeButton();
});
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded',String(open)); navigation.classList.toggle('is-open',open); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
window.matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navigation.querySelectorAll('a').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}});},{rootMargin:'-20% 0px -55% 0px'});
  document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));
}
document.querySelector('#year').textContent = new Date().getFullYear();
