// =========================
// CONFIGURATION DU JEU
// =========================

const UPGRADES = [
  // --- HARDWARE (clic) ---
  { id: 'mouse1',  name: "Souris Optique",   type: 'click', cost: 15,    power: 1,   desc: "+1 / clic" },
  { id: 'keyb1',   name: "Clavier Méca",    type: 'click', cost: 100,   power: 5,   desc: "+5 / clic" },
  { id: 'screen1', name: "Écran CRT",       type: 'click', cost: 500,   power: 15,  desc: "+15 / clic" },
  { id: 'fiber',   name: "Fibre Optique",   type: 'click', cost: 2500,  power: 50,  desc: "+50 / clic" },

  // --- HARDWARE AUTO (serveur) ---
  { id: 'server1', name: "Vieux Serveur",   type: 'auto',  cost: 250,   power: 5,   desc: "+5 / sec" },

  // --- SOFTWARE (auto) ---
  { id: 'script1', name: "Script Bash",     type: 'auto',  cost: 50,    power: 1,   desc: "+1 / sec" },
  { id: 'adblock', name: "Bloqueur Pubs",   type: 'auto',  cost: 1000,  power: 20,  desc: "+20 / sec" },
  { id: 'linux',   name: "Install Linux",   type: 'auto',  cost: 5000,  power: 100, desc: "+100 / sec" },
  { id: 'ai',      name: "IA Résistante",   type: 'auto',  cost: 20000, power: 500, desc: "+500 / sec" }
];

const STORY_EVENTS = [
  { id: 'story1', trigger: 100,   title: "MESSAGE ENTRANT",  text: "Admin GARGLE : 'Arrêtez de siphonner nos données !'" },
  { id: 'story2', trigger: 1000,  title: "ALERTE SÉCURITÉ",  text: "Pare-feu activé. Continuez la résistance." },
  { id: 'story3', trigger: 5000,  title: "VICTOIRE APPROCHE",text: "Pixeland commence à se réveiller grâce à vous." }
];

// =========================
// OBJET JEU PRINCIPAL
// =========================

const Game = {
  activeTab: 'hardware',
  clickTimestamps: [],
  achievementsConfig: [
    { id: 'first_100',   label: 'Village éveillé',     desc: 'Atteindre 100 points NIRD.' },
    { id: 'click_frenzy',label: 'Cliqueur frénétique', desc: '50 clics en moins de 10 secondes.' },
    { id: 'posture_ally',label: 'Allié postural',      desc: 'Terminer le diagnostic Decathlon.' }
  ],

  init: function () {
    if (!window.GameData) window.GameData = {};
    if (typeof GameData.points !== 'number') GameData.points = 0;
    if (!GameData.upgradesOwned) GameData.upgradesOwned = {};
    if (!GameData.storyProgress) GameData.storyProgress = [];
    if (!GameData.achievements) GameData.achievements = {};

    this.cacheDOM();
    this.bindEvents();
    this.checkBonus();
    this.initAchievements();
    this.renderShop();
    this.updateUI();
    this.updateLoreProgress();

    setInterval(() => this.tick(), 1000);
    setInterval(() => this.updateUI(), 100);

    this.log("Connexion stable.");
  },

  cacheDOM: function () {
    this.els = {
      score:        document.getElementById('score-display'),
      pps:          document.getElementById('pps-display'),
      clickPower:   document.getElementById('click-power-display'),
      hackBtn:      document.getElementById('hack-btn'),
      shop:         document.getElementById('shop-container'),
      logs:         document.getElementById('console-logs'),
      medBadge:     document.getElementById('medical-badge'),
      tabHard:      document.querySelector('.tab-btn:nth-child(1)'),
      tabSoft:      document.querySelector('.tab-btn:nth-child(2)'),
      modalContainer: document.getElementById('modal-container'),

      // Gamification
      achievementsList: document.getElementById('achievements-list'),
      loreProgressBar:  document.getElementById('lore-progress-bar'),
      loreProgressLabel:document.getElementById('lore-progress-label')
    };
  },

  bindEvents: function () {
    if (this.els.hackBtn) {
      this.els.hackBtn.addEventListener('click', (e) => this.doClick(e));
      this.els.hackBtn.addEventListener('mousedown', () => {
        this.els.hackBtn.style.transform = "scale(0.95)";
        this.els.hackBtn.style.borderColor = "white";
      });
      this.els.hackBtn.addEventListener('mouseup', () => {
        this.els.hackBtn.style.transform = "scale(1)";
        this.els.hackBtn.style.borderColor = "var(--primary)";
      });
    }

    if (this.els.tabHard) this.els.tabHard.onclick = () => this.switchTab('hardware');
    if (this.els.tabSoft) this.els.tabSoft.onclick = () => this.switchTab('software');
  },

  // Badge médical si Decathlon fait
  checkBonus: function () {
    if (GameData.hasDoneDecathlon && this.els.medBadge) {
      this.els.medBadge.classList.remove('hidden');
    }
  },

  // ====== ACHIEVEMENTS ======

  initAchievements: function () {
    if (!GameData.achievements) GameData.achievements = {};
    this.refreshAchievementsUI();
  },

  unlockAchievement: function (id) {
    if (!GameData.achievements) GameData.achievements = {};
    if (GameData.achievements[id]) return;

    GameData.achievements[id] = true;
    saveData();
    this.refreshAchievementsUI();

    const conf = this.achievementsConfig.find(a => a.id === id);
    if (conf) {
      this.showModal('Badge débloqué', conf.label + ' — ' + conf.desc);
    }
  },

  refreshAchievementsUI: function () {
    if (!this.els.achievementsList) return;
    const list = this.els.achievementsList;
    list.innerHTML = '';

    this.achievementsConfig.forEach(a => {
      const li = document.createElement('li');
      const unlocked = GameData.achievements && GameData.achievements[a.id];
      li.classList.toggle('badge-locked', !unlocked);
      li.innerHTML = `
        <span class="badge-dot"></span>
        <span>${a.label}</span>
      `;
      list.appendChild(li);
    });
  },

  // ====== BOUCLE DE JEU ======

  doClick: function (e) {
    const rawPower = GameData.clickPower || 1;
    const bonus = GameData.hasDoneDecathlon ? 1.2 : 1;
    const finalPower = rawPower * bonus;

    GameData.points += finalPower;

    this.updateUI();
    this.checkStory();
    this.checkAchievementsAfterScore();
    this.trackClickFrenzy();
    this.updateLoreProgress();
    this.checkEthicalNudge();
    saveData();

    if (e) this.spawnParticle(e.clientX, e.clientY, `+${Math.floor(finalPower)}`);
  },

  tick: function () {
    let pps = 0;
    if (!GameData.upgradesOwned) GameData.upgradesOwned = {};

    UPGRADES.forEach(u => {
      if (u.type === 'auto') {
        pps += (GameData.upgradesOwned[u.id] || 0) * u.power;
      }
    });

    const bonus = GameData.hasDoneDecathlon ? 1.2 : 1;
    const finalPPS = pps * bonus;

    if (finalPPS > 0) {
      GameData.points += finalPPS;
      this.checkStory();
      this.checkAchievementsAfterScore();
      this.updateLoreProgress();
      this.checkEthicalNudge();
      saveData();
    }
  },

  // ====== HISTOIRE / MODALES ======

  checkStory: function () {
    if (!GameData.storyProgress) GameData.storyProgress = [];
    STORY_EVENTS.forEach(evt => {
      if (GameData.points >= evt.trigger && !GameData.storyProgress.includes(evt.id)) {
        GameData.storyProgress.push(evt.id);
        this.showModal(evt.title, evt.text);
      }
    });
  },

  showModal: function (title, text, options = null) {
    if (!this.els.modalContainer) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'story-modal';

    const header = document.createElement('div');
    header.className = 'story-header';
    header.innerHTML = `<span>${title}</span><button id="modal-close-btn">X</button>`;

    const content = document.createElement('div');
    content.className = 'story-content';
    content.textContent = text;

    modal.appendChild(header);
    modal.appendChild(content);

    if (options && Array.isArray(options.buttons)) {
      options.buttons.forEach(btn => {
        const b = document.createElement('button');
        b.className = 'story-btn';
        b.textContent = btn.label;
        b.onclick = () => {
          if (btn.onClick) btn.onClick();
          overlay.remove();
        };
        modal.appendChild(b);
      });
    } else {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'story-btn';
      closeBtn.textContent = 'OK';
      closeBtn.onclick = () => overlay.remove();
      modal.appendChild(closeBtn);
    }

    overlay.appendChild(modal);
    this.els.modalContainer.innerHTML = '';
    this.els.modalContainer.appendChild(overlay);

    overlay.querySelector('#modal-close-btn').onclick = () => overlay.remove();
  },

  spawnParticle: function (x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = (x + (Math.random() * 20 - 10)) + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  },

  // ====== SHOP ======

  switchTab: function (tab) {
    this.activeTab = tab;
    if (this.els.tabHard) this.els.tabHard.classList.toggle('active', tab === 'hardware');
    if (this.els.tabSoft) this.els.tabSoft.classList.toggle('active', tab === 'software');
    this.renderShop();
    this.updateUI();
  },

  renderShop: function () {
    const container = this.els.shop;
    if (!container) return;

    container.innerHTML = "";
    if (!GameData.upgradesOwned) GameData.upgradesOwned = {};

    const filtered = UPGRADES.filter(u =>
      this.activeTab === 'hardware'
        ? (u.type === 'click' || u.id.includes('server'))
        : (u.type === 'auto' && !u.id.includes('server'))
    );

    filtered.forEach(upg => {
      const count = GameData.upgradesOwned[upg.id] || 0;
      const cost = Math.floor(upg.cost * Math.pow(1.15, count));
      const div = document.createElement('div');
      div.className = 'upgrade-item disabled';
      div.dataset.cost = cost;
      div.onclick = () => this.buyUpgrade(upg, cost);

      div.innerHTML = `
        <div class="upg-info">
          <span class="upg-name">${upg.name} (x${count})</span>
          <span class="upg-bonus">${upg.desc}</span>
        </div>
        <div class="upg-cost">${cost.toLocaleString('fr-FR')} pts</div>
      `;

      container.appendChild(div);
    });
  },

  buyUpgrade: function (upg, cost) {
    if ((GameData.points || 0) < cost) {
      this.log("Crédits insuffisants.");
      return;
    }
    GameData.points -= cost;
    if (!GameData.upgradesOwned) GameData.upgradesOwned = {};
    GameData.upgradesOwned[upg.id] = (GameData.upgradesOwned[upg.id] || 0) + 1;

    if (upg.type === 'click') {
      GameData.clickPower = (GameData.clickPower || 1) + upg.power;
    }

    this.renderShop();
    this.updateUI();
    saveData();
  },

  // ====== UI / LOGS ======

  log: function (msg) {
    if (!this.els.logs) return;
    const p = document.createElement('p');
    p.textContent = `> ${msg}`;
    this.els.logs.prepend(p);
  },

  updateUI: function () {
    const pts = GameData.points || 0;
    if (this.els.score) this.els.score.textContent = Math.floor(pts).toLocaleString('fr-FR');

    // Calcul PPS affiché
    let pps = 0;
    UPGRADES.forEach(u => {
      if (u.type === 'auto') {
        pps += (GameData.upgradesOwned[u.id] || 0) * u.power;
      }
    });
    const bonus = GameData.hasDoneDecathlon ? 1.2 : 1;
    const finalPPS = pps * bonus;

    if (this.els.pps) this.els.pps.textContent = finalPPS.toFixed(1).replace('.', ',');

    if (this.els.clickPower) {
      const raw = GameData.clickPower || 1;
      this.els.clickPower.textContent = Math.floor(raw * bonus);
    }

    // Mise à jour état "achetable" des upgrades
    const shopItems = this.els.shop ? this.els.shop.querySelectorAll('.upgrade-item') : [];
    shopItems.forEach(div => {
      const cost = parseInt(div.dataset.cost, 10) || 0;
      if (pts >= cost) div.classList.remove('disabled');
      else div.classList.add('disabled');
    });
  },

  // ====== GAMIFICATION SUPPLÉMENTAIRE ======

  checkAchievementsAfterScore: function () {
    const pts = GameData.points || 0;
    if (pts >= 100) this.unlockAchievement('first_100');
    if (GameData.hasDoneDecathlon) this.unlockAchievement('posture_ally');
  },

  trackClickFrenzy: function () {
    const now = Date.now();
    this.clickTimestamps.push(now);
    this.clickTimestamps = this.clickTimestamps.filter(t => now - t <= 10000);
    if (this.clickTimestamps.length >= 50) {
      this.unlockAchievement('click_frenzy');
    }
  },

  updateLoreProgress: function () {
    if (!this.els.loreProgressBar || !this.els.loreProgressLabel) return;

    const thresholds = [0, 500, 2000, 10000]; // mêmes paliers que lore.js
    const pts = GameData.points || 0;

    let next = thresholds.find(t => t > pts);
    let prev = 0;

    if (!next) {
      this.els.loreProgressBar.style.width = '100%';
      this.els.loreProgressLabel.textContent = 'Tous les chapitres débloqués';
      return;
    }

    for (let i = 0; i < thresholds.length; i++) {
      if (thresholds[i] <= pts) prev = thresholds[i];
    }

    const localProgress = (pts - prev) / (next - prev);
    this.els.loreProgressBar.style.width = (localProgress * 100) + '%';
    this.els.loreProgressLabel.textContent = `${Math.floor(pts)} / ${next} pts`;
  },

  // Nudge Decathlon = "dark pattern éthique"
  checkEthicalNudge: function () {
    if (GameData.hasDoneDecathlon) return;
    if (GameData.dismissedDecathlonNudge) return;
    if ((GameData.points || 0) < 300) return;

    GameData.dismissedDecathlonNudge = true;
    saveData();

    this.showModal(
      'Ton code tient, ton dos aussi ?',
      'Tu as déjà bien renforcé Pixeland. Prends 2 minutes pour vérifier que ta posture suit la cadence.',
      {
        buttons: [
          {
            label: 'Lancer mon diagnostic postural (recommandé)',
            onClick: () => {
              window.location.href = 'decathlon.html';
            }
          },
          {
            label: 'Plus tard',
            onClick: () => { /* l’utilisateur garde le contrôle */ }
          }
        ]
      }
    );
  }
};

// Lancement du jeu
document.addEventListener('DOMContentLoaded', () => Game.init());
