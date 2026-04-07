const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const PODCASTS = [];
const history = JSON.parse(localStorage.getItem('podatorHistory') || '{}');
let currentDate = new Date();

class PodatorApp {
  constructor() {
    this.loadPodcasts();
    this.init();
  }

  async loadPodcasts() {
    try {
      const response = await fetch('podcasts.json');
      const data = await response.json();
      PODCASTS.push(...data);
    } catch (e) {
      console.error('Erreur chargement podcasts:', e);
    }
  }

  init() {
    this.setupEventListeners();
    this.renderCalendar();
    this.updateStatusBar();
    this.updateLastCheck();

    // Mettre à jour le lastCheck toutes les minutes
    setInterval(() => this.updateLastCheck(), 60000);
  }

  setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
    document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
    document.getElementById('checkNow').addEventListener('click', () => this.checkNow());
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());

    document.getElementById('detailModal').addEventListener('click', (e) => {
      if (e.target.id === 'detailModal') this.closeModal();
    });
  }

  previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.renderCalendar();
  }

  nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.renderCalendar();
  }

  renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    document.getElementById('monthYear').textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    let current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dayEl = this.createDayElement(current);
      calendar.appendChild(dayEl);
      current.setDate(current.getDate() + 1);
    }

    this.updateStats();
  }

  updateStats() {
    const today = this.formatDate(new Date());
    const data = history[today];
    const errorsEl = document.getElementById('todayErrors');

    if (!data) {
      errorsEl.textContent = '—';
    } else {
      errorsEl.textContent = data.errors.length;
    }
  }

  createDayElement(date) {
    const div = document.createElement('div');
    const dateStr = this.formatDate(date);
    const dayNum = date.getDate();

    div.className = 'day';
    if (date.getMonth() !== currentDate.getMonth()) div.classList.add('other-month');
    if (this.isToday(date)) div.classList.add('today');

    const dayData = history[dateStr];
    if (dayData && dayData.errors && dayData.errors.length > 0) {
      div.classList.add('has-errors');
      div.innerHTML = `
        <div class="day-number">${dayNum}</div>
        <div class="day-badge">${dayData.errors.length}</div>
        <div class="day-summary">${dayData.ok}/${dayData.ok + dayData.errors.length}</div>
      `;
    } else if (dayData) {
      div.innerHTML = `
        <div class="day-number">${dayNum}</div>
        <div class="day-summary">${dayData.ok} ✓</div>
      `;
    } else {
      div.innerHTML = `<div class="day-number">${dayNum}</div>`;
    }

    div.addEventListener('click', () => {
      if (date.getMonth() === currentDate.getMonth()) {
        this.showDetails(dateStr);
      }
    });

    return div;
  }

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  async checkNow() {
    const btn = document.getElementById('checkNow');
    btn.disabled = true;
    btn.classList.add('loading');
    btn.textContent = 'Vérification...';

    const today = this.formatDate(new Date());
    const results = { ok: 0, errors: [] };

    for (const podcast of PODCASTS) {
      const check = await this.checkPodcast(podcast);
      if (check.error) {
        results.errors.push({
          name: podcast.name,
          error: check.error
        });
      } else {
        results.ok++;
      }
    }

    history[today] = results;
    localStorage.setItem('podatorHistory', JSON.stringify(history));
    localStorage.setItem('lastCheckTime', new Date().toISOString());

    this.renderCalendar();
    this.updateStatusBar();
    this.updateLastCheck();
    this.showDetails(today);

    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = 'Vérifier maintenant';
  }

  updateLastCheck() {
    const lastCheckTime = localStorage.getItem('lastCheckTime');
    const lastCheckEl = document.getElementById('lastCheck');

    if (!lastCheckTime) {
      lastCheckEl.textContent = '';
      return;
    }

    const date = new Date(lastCheckTime);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let text = '';
    if (diffMins < 1) {
      text = 'À l\'instant';
    } else if (diffMins < 60) {
      text = `Il y a ${diffMins}m`;
    } else if (diffHours < 24) {
      text = `Il y a ${diffHours}h`;
    } else {
      text = `Il y a ${diffDays}j`;
    }

    lastCheckEl.textContent = text;
  }

  async checkPodcast(podcast) {
    try {
      const url = CORS_PROXY + encodeURIComponent(podcast.url);
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const xml = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'application/xml');

      if (doc.getElementsByTagName('parsererror').length > 0) {
        return { error: 'XML invalide' };
      }

      const items = doc.getElementsByTagName('item');
      if (items.length === 0) {
        return { error: 'Pas d\'épisodes' };
      }

      const latestItem = items[0];
      const enclosure = latestItem.getElementsByTagName('enclosure')[0];

      if (!enclosure) {
        return { error: 'Pas d\'enclosure' };
      }

      const length = parseInt(enclosure.getAttribute('length')) || 0;
      if (length < 100000) { // < 100KB
        return { error: `Fichier trop petit: ${this.formatBytes(length)}` };
      }

      return { ok: true };
    } catch (e) {
      return { error: e.name === 'AbortError' ? 'Timeout' : 'Erreur réseau' };
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  showDetails(dateStr) {
    const data = history[dateStr];
    const modal = document.getElementById('detailModal');
    const dateEl = document.getElementById('modalDate');
    const details = document.getElementById('modalDetails');

    dateEl.textContent = new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (!data) {
      details.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>Aucune vérification pour ce jour</p>
        </div>
      `;
    } else {
      let html = `
        <div class="detail-section">
          <h4>Résumé</h4>
          <div class="result-item">
            <div class="result-item-title">✓ ${data.ok} flux OK</div>
          </div>
      `;

      if (data.errors.length > 0) {
        html += `
          <div class="result-item error">
            <div class="result-item-title">✗ ${data.errors.length} flux avec erreur</div>
          </div>
        </div>
        <div class="detail-section">
          <h4>Erreurs détectées</h4>
        `;

        data.errors.forEach(err => {
          html += `
            <div class="result-item error">
              <div class="result-item-title">${err.name}</div>
              <div class="result-item-info">${err.error}</div>
            </div>
          `;
        });
      } else {
        html += `</div>`;
      }

      html += '</div>';
      details.innerHTML = html;
    }

    modal.classList.add('open');
  }

  closeModal() {
    document.getElementById('detailModal').classList.remove('open');
  }

  updateStatusBar() {
    const bar = document.getElementById('statusBar');
    const today = this.formatDate(new Date());
    const data = history[today];

    if (!data) {
      bar.textContent = '📊 Aucune vérification pour aujourd\'hui. Cliquez sur "Vérifier maintenant" pour lancer une vérification.';
      bar.classList.remove('success', 'error');
    } else if (data.errors.length === 0) {
      bar.textContent = `✓ Tous les flux sont OK (${data.ok}/${data.ok})`;
      bar.classList.add('success');
      bar.classList.remove('error');
    } else {
      bar.textContent = `✗ ${data.errors.length} erreur(s) détectée(s) (${data.ok}/${data.ok + data.errors.length} OK)`;
      bar.classList.add('error');
      bar.classList.remove('success');
    }
  }
}

// Attendre le chargement des podcasts avant d'initialiser
const app = new PodatorApp();
setTimeout(() => app.init(), 500);
