// БАЗА ДАНИХ ІНІЦІАТИВ
const initiatives = [
  { id: 1, title: "Допомога сім'ям з дітьми у Вінниці", category: "Збір речей", city: "Вінниця", format: "Офлайн", date: "До 10.11.2025", difficulty: "Легко", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500", address: "м. Вінниця, вул. Соборна, 25", coords: [49.232, 28.468] },
  { id: 2, title: "Психологічна підтримка для постраждалих", category: "Психологічна підтримка", city: "Онлайн", format: "Онлайн", date: "До 15.11.2025", difficulty: "Середньо", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500", address: "Дистанційно (Zoom / Meet)", coords: null }, // Онлайн - без піна
  { id: 3, title: "Збір продуктів для ВПО", category: "Продукти", city: "Вінниця", format: "Офлайн", date: "До 12.11.2025", difficulty: "Легко", image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500", address: "м. Вінниця, Хмельницьке шосе, 14", coords: [49.238, 28.455] },
  { id: 4, title: "Підтримка літніх людей у Вінниці", category: "Допомога людям", city: "Вінниця", format: "Офлайн", date: "До 20.11.2025", difficulty: "Складно", image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=500", address: "м. Вінниця, вул. Келецька, 82", coords: [49.225, 28.420] },
  { id: 5, title: "Прибирання територій після обстрілів", category: "Екологія", city: "Вінниця", format: "Офлайн", date: "До 22.11.2025", difficulty: "Середньо", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500", address: "м. Вінниця, Замостянський район", coords: [49.245, 28.489] },
  { id: 6, title: "Теплі речі для ВПО", category: "Збір речей", city: "Вінниця", format: "Офлайн", date: "До 30.11.2025", difficulty: "Легко", image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500", address: "м. Вінниця, вул. Пирогова, 47", coords: [49.229, 28.450] }
];

// Заявки
let userApplications = [
  { id: 1, title: "Допомога сім'ям з дітьми", date: "Вінниця • 10.11.2025", status: "Очікує", img: initiatives[0].image, initId: 1 },
  { id: 2, title: "Збір продуктів для ВПО", date: "Вінниця • 12.11.2025", status: "Підтверджено", img: initiatives[2].image, initId: 3 },
  { id: 3, title: "Психологічна підтримка", date: "Вінниця • 15.11.2025", status: "Підтверджено", img: initiatives[1].image, initId: 2 },
  { id: 4, title: "Підтримка літніх людей", date: "Вінниця • 16.11.2025", status: "Очікує", img: initiatives[3].image, initId: 4 },
  { id: 5, title: "Прибирання територій", date: "Вінниця • 22.11.2025", status: "Підтверджено", img: initiatives[4].image, initId: 5 },
  { id: 6, title: "Теплі речі для ВПО", date: "Вінниця • 30.09.2025", status: "Завершено", img: initiatives[5].image, initId: 6 }
];

let savedFavIds = JSON.parse(localStorage.getItem('volo_favs')) || [1, 2, 3, 4, 6];
let userBonusCount = parseInt(localStorage.getItem('volo_bonuses')) || 320;
let selectedInitId = 1;
let currentAppFilter = 'all';

let selectedCity = 'Усі міста';
let selectedCategory = 'Усі напрями';
let selectedDiff = 'Будь-яка';
let selectedFormat = 'all';

// Реальна карта (Leaflet)
let leafletMap = null;
let markersLayer = null;

// ФУНКЦІЯ ОНОВЛЕННЯ ПРОФІЛЮ 
function updateProfileDisplay() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || {
        name: 'Ангеліна',
        surname: 'Борецька',
        email: 'angelina@gmail.com',
        city: 'Вінниця',
        bio: 'Студентка, допомагаю дітям та ВПО',
        phone: '+380 (97) 123 45 67'
    };

    const initials = (user.name[0] + (user.surname[0] || '')).toUpperCase();
    
    if(document.getElementById('cab-profile-name')) {
        document.getElementById('cab-profile-name').innerText = `${user.name} ${user.surname}`;
        document.getElementById('cab-profile-email').innerText = user.email;
        document.getElementById('cab-sidebar-avatar').innerText = initials;
    }
    if(document.getElementById('settings-avatar')) {
        document.getElementById('settings-avatar').innerText = initials;
        document.getElementById('set-name').value = user.name;
        document.getElementById('set-surname').value = user.surname;
        document.getElementById('set-email').value = user.email;
        document.getElementById('set-city').value = user.city;
        document.getElementById('set-bio').value = user.bio;
        document.getElementById('set-phone').value = user.phone;
    }
}

function init() {
  updateProfileDisplay();
  renderHomeCards();
  renderMapCards();
  renderCabinetApps();
  renderSavedFullGrid();
  renderHistory();
  document.getElementById('bonuses-live-val-public').innerText = userBonusCount;
  if(document.getElementById('bonuses-live-val')) document.getElementById('bonuses-live-val').innerText = userBonusCount;

  // ROUTING FIX (Помилка 3)
  if (!window.location.hash) {
    history.replaceState({ screen: 'screen-home' }, '', '#home');
  }
  handleHashRouting();
}

// =========================================================
// ROUTING
// =========================================================
function navigateTo(screenId) {
  let hash = '#home';
  if (screenId === 'screen-map') hash = '#map';
  if (screenId === 'screen-bonuses') hash = '#bonuses';
  if (screenId === 'screen-cabinet') hash = '#cabinet';
  if (screenId === 'screen-sponsors') hash = '#sponsors';
  if (screenId === 'screen-about') hash = '#about';
  if (screenId === 'screen-register') hash = '#register';
  if (screenId === 'screen-login') hash = '#login';
  if (screenId === 'screen-contact') hash = '#contact';
  if (screenId === 'screen-detail') hash = '#initiative-' + selectedInitId;
  if (screenId === 'screen-apply') hash = '#apply';

  // FIX 4: Очищаємо підкреслення навігації при переході до іншого екрану
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

  history.pushState({ screen: screenId }, '', hash);
  showScreen(screenId);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  if (screenId === 'screen-home') document.getElementById('nav-btn-home').classList.add('active');
  if (screenId === 'screen-map') document.getElementById('nav-btn-map').classList.add('active');
  if (screenId === 'screen-bonuses') document.getElementById('nav-btn-bonuses').classList.add('active');
  if (screenId === 'screen-cabinet') document.getElementById('nav-btn-cabinet').classList.add('active');
  if (screenId === 'screen-sponsors') document.getElementById('nav-btn-sponsors').classList.add('active');
  if (screenId === 'screen-about') document.getElementById('nav-btn-about').classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Init real map if Map tab is opened
  if (screenId === 'screen-map') {
      setTimeout(initRealMap, 100);
  }
}

window.addEventListener('popstate', (e) => {
  handleHashRouting();
});

function handleHashRouting() {
  const hash = window.location.hash;
  if (hash === '#map') showScreen('screen-map');
  else if (hash === '#bonuses') showScreen('screen-bonuses');
  else if (hash === '#cabinet') showScreen('screen-cabinet');
  else if (hash === '#sponsors') showScreen('screen-sponsors');
  else if (hash === '#about') showScreen('screen-about');
  else if (hash === '#register') showScreen('screen-register');
  else if (hash === '#login') showScreen('screen-login');
  else if (hash === '#contact') showScreen('screen-contact');
  else if (hash === '#apply') showScreen('screen-apply');
  else if (hash.startsWith('#initiative-')) {
    const id = parseInt(hash.split('-')[1]);
    if (id) {
      openDetailView(id, false);
    }
  }
  else showScreen('screen-home');
}

// =========================================================
// REAL LEAFLET MAP (Інтерактивна карта Вінниці - Помилка 1 fix)
// =========================================================
function initRealMap() {
    if (leafletMap) {
        leafletMap.invalidateSize();
        return;
    }
    
    leafletMap = L.map('real-map-container').setView([49.2331, 28.4682], 13);
    
    // FIX 1: Використовуємо CartoDB Voyager щоб не було 403 Access Blocked на локалці
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 19
    }).addTo(leafletMap);
    
    markersLayer = L.layerGroup().addTo(leafletMap);
    renderMapCards(); 
}

function updateMapMarkers(filteredInitiatives) {
    if(!markersLayer) return;
    markersLayer.clearLayers();
    
    filteredInitiatives.forEach(init => {
        if(init.coords) {
            const marker = L.marker(init.coords).addTo(markersLayer);
            marker.bindPopup(`
                <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
                    <b style="font-size: 14px;">${init.title}</b>
                    <div style="font-size: 12px; color: #707b8b; margin: 4px 0;">📍 ${init.address}</div>
                    <button onclick="openDetailView(${init.id})" style="background: #e65135; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; width: 100%;">Детальніше</button>
                </div>
            `);
        }
    });
}

// =========================================================
// ФІЛЬТРИ З ДИНАМІЧНОЮ ГАЛОЧКОЮ 
// =========================================================
function toggleDropdownMenu(menuId) {
  const menu = document.getElementById(menuId);
  const isOpen = menu.classList.contains('open');
  closeAllDropdownMenus();
  if (!isOpen) {
    menu.classList.add('open');
    if(menuId === 'menu-city') {
        document.getElementById('search-city-input').focus();
    }
  }
}

function closeAllDropdownMenus() {
  document.querySelectorAll('.dropdown-popup-list').forEach(m => m.classList.remove('open'));
}

window.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown-widget')) {
    closeAllDropdownMenus();
  }
});

function chooseCity(city) {
  selectedCity = city;
  document.getElementById('label-city-val').innerText = city;
  updateDropdownSelectedVisual('menu-city', city);
  closeAllDropdownMenus();
  
  // FIX 7: Очищаємо пошук при виборі та скидаємо фільтр
  document.getElementById('search-city-input').value = '';
  filterCityDropdown('');
  
  renderMapCards();
}

// FIX 7: Пошук по місту не чутливий до регістру і відновлює "Усі міста"
function filterCityDropdown(search) {
  const term = search.toLowerCase().trim();
  document.querySelectorAll('#city-options-container .dropdown-option').forEach(opt => {
    const rawText = opt.innerText.replace('✓', '').trim();
    const text = rawText.toLowerCase();
    
    if (term === '' || text.includes(term)) {
        opt.style.display = 'flex';
    } else {
        opt.style.display = 'none';
    }
  });
}

function chooseCategory(cat) {
  selectedCategory = cat;
  document.getElementById('label-cat-val').innerText = cat;
  updateDropdownSelectedVisual('menu-cat', cat);
  closeAllDropdownMenus();
  renderMapCards();
}

function chooseDifficulty(diff) {
  selectedDiff = diff;
  document.getElementById('label-diff-val').innerText = diff;
  updateDropdownSelectedVisual('menu-diff', diff);
  closeAllDropdownMenus();
  renderMapCards();
}

function chooseFormat(fmt) {
  selectedFormat = fmt;
  document.querySelectorAll('.toggle-cap-btn').forEach(b => b.classList.remove('active'));
  if (fmt === 'all') document.getElementById('btn-fmt-all').classList.add('active');
  if (fmt === 'Онлайн') document.getElementById('btn-fmt-online').classList.add('active');
  if (fmt === 'Офлайн') document.getElementById('btn-fmt-offline').classList.add('active');
  renderMapCards();
}

// FIX 1: Календар
function chooseDateFilter(val) {
    document.getElementById('label-date-val').innerText = val;
    closeAllDropdownMenus();
}

function updateDropdownSelectedVisual(menuId, val) {
  document.querySelectorAll(`#${menuId} .dropdown-option`).forEach(opt => {
    const rawText = opt.innerText.replace('✓', '').trim();
    if (rawText === val || (rawText.startsWith(val) && val !== 'Усі міста')) {
      opt.classList.add('selected');
      if (!opt.innerHTML.includes('<span>✓</span>')) {
          opt.innerHTML = `${rawText} <span>✓</span>`;
      }
    } else {
      opt.classList.remove('selected');
      opt.innerHTML = rawText;
    }
  });
}

// =========================================================
// РЕНДЕРИНГ
// =========================================================
function renderMapCards() {
  const container = document.getElementById('map-cards-list');
  const filtered = initiatives.filter(i => {
    const c1 = selectedCity === 'Усі міста' || i.city === selectedCity;
    const c2 = selectedCategory === 'Усі напрями' || i.category === selectedCategory;
    
    let difficultyMatch = true;
    if (selectedDiff !== 'Будь-яка') {
      difficultyMatch = i.difficulty === selectedDiff;
    }
    
    const c4 = selectedFormat === 'all' || i.format === selectedFormat;
    return c1 && c2 && difficultyMatch && c4;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p style="padding: 24px; color: var(--gray-muted); text-align: center;">За обраними фільтрами ініціатив не знайдено.</p>';
    updateMapMarkers([]);
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isSaved = savedFavIds.includes(item.id);
    const heartColor = isSaved ? 'var(--primary)' : 'var(--gray-muted)';
    
    return `
    <div class="map-card-sm" onclick="openDetailView(${item.id})">
      <img src="${item.image}" alt="${item.title}">
      <div style="flex: 1; position: relative;">
        <!-- FIX 3: Сердечко на мапі оновлюється -->
        <div style="position: absolute; top: 0; right: 0; color: ${heartColor}; font-size: 16px;">❤</div>
        <span class="tag-badge">${item.category}</span>
        <div style="font-size: 14px; font-weight: 800; line-height: 1.25; margin: 2px 0; padding-right: 16px;">${item.title}</div>
        <div style="font-size: 11px; color: var(--gray-muted);">📍 ${item.city} • 📅 ${item.date}</div>
        <div style="font-size: 11px; margin-top: 4px;">Складність: <b>${item.difficulty}</b></div>
      </div>
    </div>
  `}).join('');
  
  updateMapMarkers(filtered);
}

function renderHomeCards() {
  const container = document.getElementById('popular-cards-box');
  container.innerHTML = initiatives.slice(0, 4).map(item => `
    <div class="card-v" onclick="openDetailView(${item.id})">
      <img src="${item.image}" class="card-v-img" alt="${item.title}">
      <div class="card-v-pad">
        <span class="tag-badge">${item.category}</span>
        <div class="card-v-title">${item.title}</div>
        <div style="font-size: 12px; color: var(--gray-muted);">📍 ${item.city}</div>
        <div style="font-size: 12px; color: var(--gray-muted); margin-bottom: 12px;">📅 ${item.date}</div>
        <div style="margin-top: auto; display: flex; justify-content: space-between; font-size: 12px;">
          <span>Складність:</span>
          <b>${item.difficulty}</b>
        </div>
      </div>
    </div>
  `).join('');
}

// =========================================================
// ДЕТАЛІ ІНІЦІАТИВИ
// =========================================================
function openDetailView(id, pushHistory = true) {
  selectedInitId = id;
  const item = initiatives.find(i => i.id === id) || initiatives[0];
  document.getElementById('d-image').src = item.image;
  document.getElementById('d-title').innerText = item.title;
  document.getElementById('d-badge').innerText = item.category;
  document.getElementById('d-loc').innerText = `📍 ${item.city}, Старе місто`;
  document.getElementById('d-date').innerText = `📅 ${item.date}`;
  document.getElementById('d-format').innerText = item.format;
  document.getElementById('d-diff').innerText = `${item.difficulty}`;
  document.getElementById('d-side-address').innerText = item.address;

  updateSaveBtnState();
  
  const applyBtn = document.getElementById('btn-apply-detail');
  const alreadyApplied = userApplications.some(app => app.initId === selectedInitId);
  
  if (alreadyApplied) {
    applyBtn.innerText = 'Заявку вже подано ✓';
    applyBtn.classList.replace('btn-coral', 'btn-outline');
    applyBtn.onclick = () => { navigateTo('screen-cabinet'); switchCabTab('apps'); };
  } else {
    applyBtn.innerText = 'Подати заявку →';
    applyBtn.classList.replace('btn-outline', 'btn-coral');
    applyBtn.onclick = goToApplyCurrent;
  }
  
  if (pushHistory) {
      navigateTo('screen-detail');
  } else {
      showScreen('screen-detail');
  }
}

// FIX 5: Динамічні дані у формі заявки (немає статичних Вінниця/Дата)
function goToApplyCurrent() {
  const item = initiatives.find(i => i.id === selectedInitId) || initiatives[0];
  
  document.getElementById('form-initiative').value = item.title;
  document.getElementById('form-city').value = item.city;
  document.getElementById('form-date').value = item.date.replace('До ', '');
  document.getElementById('form-address').value = item.address;
  
  // Якщо користувач зареєстрований, підставити його дані
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user) {
      document.getElementById('form-name').value = `${user.name} ${user.surname}`;
      document.getElementById('form-email').value = user.email;
      if (user.phone) document.getElementById('form-phone').value = user.phone;
  }
  
  document.getElementById('apply-lead-text').innerText = `Заповни форму, щоб долучитися до ініціативи`;
  document.getElementById('apply-success-box').style.display = 'none';
  navigateTo('screen-apply');
}

function toggleSaveCurrent() {
  if (savedFavIds.includes(selectedInitId)) {
    savedFavIds = savedFavIds.filter(i => i !== selectedInitId);
  } else {
    savedFavIds.push(selectedInitId);
  }
  localStorage.setItem('volo_favs', JSON.stringify(savedFavIds));
  updateSaveBtnState();
  renderSavedFullGrid();
  // FIX 3: Оновлюємо картки на мапі щоб сердечко відмалювалось
  if(document.getElementById('screen-map').classList.contains('active')) {
      renderMapCards();
  }
}

function updateSaveBtnState() {
  const btn = document.getElementById('d-save-btn');
  if (savedFavIds.includes(selectedInitId)) {
    btn.innerHTML = '❤️ Збережено';
    btn.style.borderColor = 'var(--primary)';
    btn.style.color = 'var(--primary)';
  } else {
    btn.innerHTML = '🔖 Зберегти';
    btn.style.borderColor = 'var(--dark)';
    btn.style.color = 'var(--dark)';
  }
}

function handleFormSubmission(e) {
  e.preventDefault();
  
  const alreadyApplied = userApplications.some(app => app.initId === selectedInitId);
  if (alreadyApplied) {
      const errorBox = document.getElementById('apply-error-box');
      errorBox.style.display = 'block';
      errorBox.innerText = 'Ви вже подали заявку на цю ініціативу. Перевірте статус у кабінеті.';
      setTimeout(() => errorBox.style.display = 'none', 3000);
      return;
  }
  
  const target = document.getElementById('form-initiative').value;
  const item = initiatives.find(i => i.id === selectedInitId) || initiatives[0];
  
  userApplications.unshift({
    id: Date.now(),
    title: target,
    date: `${item.city} • Сьогодні`,
    status: "Очікує",
    img: item.image,
    initId: selectedInitId
  });
  
  userBonusCount += 50;
  localStorage.setItem('volo_bonuses', userBonusCount);
  document.getElementById('bonuses-live-val-public').innerText = userBonusCount;
  if(document.getElementById('bonuses-live-val')) document.getElementById('bonuses-live-val').innerText = userBonusCount;
  document.getElementById('apply-success-box').style.display = 'block';
  
  setTimeout(() => {
    renderCabinetApps();
    navigateTo('screen-cabinet');
  }, 1400);
}

// =========================================================
// КАБІНЕТ ТА ЗБЕРЕЖЕННЯ
// =========================================================
function switchCabTab(tab) {
  document.querySelectorAll('.cab-pane-view').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.cab-nav-item').forEach(b => b.classList.remove('active'));

  if (tab === 'apps') {
    document.getElementById('cab-pane-apps').style.display = 'block';
    document.getElementById('tab-btn-apps').classList.add('active');
  } else if (tab === 'favs') {
    document.getElementById('cab-pane-favs').style.display = 'block';
    document.getElementById('tab-btn-favs').classList.add('active');
  } else if (tab === 'history') {
    document.getElementById('cab-pane-history').style.display = 'block';
    document.getElementById('tab-btn-history').classList.add('active');
  } else if (tab === 'hours') {
    document.getElementById('cab-pane-hours').style.display = 'block';
    document.getElementById('tab-btn-hours').classList.add('active');
  } else if (tab === 'bonuses') {
    document.getElementById('cab-pane-bonuses').style.display = 'block';
    document.getElementById('tab-btn-bonuses').classList.add('active');
  } else if (tab === 'settings') {
    document.getElementById('cab-pane-settings').style.display = 'block';
    document.getElementById('tab-btn-settings').classList.add('active');
  }
}

function filterAppStatus(status) {
  currentAppFilter = status;
  document.querySelectorAll('#cab-pane-apps .toggle-cap-btn').forEach(b => b.classList.remove('active'));
  if (status === 'all') document.getElementById('filter-app-all').classList.add('active');
  if (status === 'Очікує') document.getElementById('filter-app-wait').classList.add('active');
  if (status === 'Підтверджено') document.getElementById('filter-app-conf').classList.add('active');
  if (status === 'Завершено') document.getElementById('filter-app-done').classList.add('active');
  renderCabinetApps();
}

function cancelApplication(id) {
  userApplications = userApplications.filter(a => a.id !== id);
  renderCabinetApps();
  // FIX 6: Кнопка в каталозі теж скидається
  openDetailView(selectedInitId, false);
}

function renderCabinetApps() {
  const appList = document.getElementById('cab-my-apps-list');
  const filtered = userApplications.filter(a => currentAppFilter === 'all' || a.status === currentAppFilter);
  document.getElementById('cnt-app-all').innerText = userApplications.length;

  appList.innerHTML = filtered.map(app => {
    let badgeClass = 'status-wait';
    if (app.status === 'Підтверджено') badgeClass = 'status-confirmed';
    if (app.status === 'Завершено') badgeClass = 'status-done';

    return `
      <div style="background: white; border: 1px solid var(--gray-border); border-radius: var(--radius-md); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${app.img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
          <div>
            <b style="font-size: 15px;">${app.title}</b>
            <div style="font-size: 12px; color: var(--gray-muted);">${app.date}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="app-status-badge ${badgeClass}">${app.status}</span>
          <button class="btn-outline" style="padding: 6px 14px; font-size: 12px;" onclick="openDetailView(${app.initId})">Детальніше</button>
          ${app.status === 'Очікує' ? `<button class="btn-outline" style="padding: 6px 14px; font-size: 12px; color: var(--primary); border-color: var(--primary);" onclick="cancelApplication(${app.id})">Скасувати</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Збережені прев'ю
  const favPreview = document.getElementById('cab-saved-preview');
  favPreview.innerHTML = initiatives.slice(0, 2).map(item => `
    <div style="background: white; border: 1px solid var(--gray-border); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="openDetailView(${item.id})">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${item.image}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
        <div>
          <b style="font-size: 14px;">${item.title}</b>
          <div style="font-size: 11px; color: var(--gray-muted);">📍 ${item.city}</div>
        </div>
      </div>
      <span>❤️</span>
    </div>
  `).join('');
}

function renderSavedFullGrid() {
  const grid = document.getElementById('favs-full-grid');
  const savedItems = initiatives.filter(i => savedFavIds.includes(i.id));
  document.getElementById('fav-count-lead').innerText = savedItems.length;

  grid.innerHTML = savedItems.map(item => `
    <div class="card-v">
      <img src="${item.image}" class="card-v-img">
      <div class="card-v-pad">
        <span class="tag-badge">${item.category}</span>
        <div class="card-v-title">${item.title}</div>
        <div style="font-size: 12px; color: var(--gray-muted);">📍 ${item.city} • 📅 ${item.date}</div>
        <button class="btn-coral" style="margin-top: 14px; width: 100%; justify-content: center;" onclick="openDetailView(${item.id})">Детальніше</button>
      </div>
    </div>
  `).join('');
}

function renderHistory() {
  const container = document.getElementById('history-items-list');
  const list = [
    { title: "Допомога сім'ям з дітьми", date: "10.11.2025", hours: "+4 год", loc: "м. Вінниця, вул. Соборна", img: initiatives[0].image, id: 1 },
    { title: "Підтримка літніх людей у Вінниці", date: "10.11.2025", hours: "+6 год", loc: "м. Вінниця, вул. Соборна", img: initiatives[3].image, id: 4 },
    { title: "Прибирання території", date: "10.11.2025", hours: "+4 год", loc: "м. Вінниця, вул. Соборна", img: initiatives[4].image, id: 5 }
  ];
  container.innerHTML = list.map(h => `
    <div style="background: white; border: 1px solid var(--gray-border); border-radius: var(--radius-md); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <img src="${h.img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
        <div>
          <b style="font-size: 15px;">${h.title}</b>
          <div style="font-size: 12px; color: var(--gray-muted);">📍 ${h.loc} • 📅 ${h.date}</div>
          <div style="font-size: 11px; color: #1d9255; font-weight: 700;">Статус: Завершено ✓</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <span style="font-weight: 900; font-size: 15px; color: var(--primary);">${h.hours}</span>
        <button class="btn-coral" style="padding: 8px 18px; font-size: 13px;" onclick="openDetailView(${h.id})">Детальніше</button>
      </div>
    </div>
  `).join('');
}

// =========================================================
// ФОРМИ ТА МОДАЛКИ (ПОМИЛКА 5, 4, 3)
// =========================================================
// FIX 4: Реєстрація зчитує дані
function handleRegistration(e) {
  e.preventDefault();
  
  const firstName = document.getElementById('reg-name').value;
  const lastName = document.getElementById('reg-surname').value;
  const email = document.getElementById('reg-email').value;
  const city = document.getElementById('reg-city').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  
  const user = {
      name: firstName,
      surname: lastName,
      email: email,
      city: city,
      role: role,
      bio: '',
      phone: ''
  };
  
  localStorage.setItem('currentUser', JSON.stringify(user));
  updateProfileDisplay();
  navigateTo('screen-cabinet');
}

function handleLogin(e) {
  e.preventDefault();
  navigateTo('screen-cabinet');
}

// FIX 5: Налаштування зберігаються
function saveProfileSettings(e) {
    e.preventDefault();
    const user = {
        name: document.getElementById('set-name').value,
        surname: document.getElementById('set-surname').value,
        email: document.getElementById('set-email').value,
        city: document.getElementById('set-city').value,
        bio: document.getElementById('set-bio').value,
        phone: document.getElementById('set-phone').value,
        role: 'volunteer'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateProfileDisplay();
    
    const box = document.getElementById('settings-success-box');
    box.style.display = 'block';
    setTimeout(() => box.style.display = 'none', 3000);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const ogText = btn.innerText;
  btn.innerText = "Надіслано ✓";
  btn.style.background = "var(--badge-green-text)";
  setTimeout(() => {
    e.target.reset();
    btn.innerText = ogText;
    btn.style.background = "var(--primary)";
  }, 3000);
}

function openHowItWorksModal() {
  document.getElementById('modalHowItWorks').classList.add('open');
}
function closeHowItWorksModal() {
  document.getElementById('modalHowItWorks').classList.remove('open');
}

function openSponsorModal() {
  document.getElementById('modalSponsor').classList.add('open');
}
function closeSponsorModal() {
  document.getElementById('modalSponsor').classList.remove('open');
}
function handleSponsorSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "Запит надіслано ✓";
    btn.style.background = "var(--badge-green-text)";
    setTimeout(() => {
        closeSponsorModal();
        btn.innerText = "Надіслати запит →";
        btn.style.background = "var(--primary)";
        e.target.reset();
    }, 2000);
}

// FIX 3: Кнопки обміну балів (апострофи)
function redeemDiscount(btnElement, cost) {
  const originalText = btnElement.innerText;
  
  if (userBonusCount >= cost) {
    userBonusCount -= cost;
    localStorage.setItem('volo_bonuses', userBonusCount);
    document.getElementById('bonuses-live-val-public').innerText = userBonusCount;
    if(document.getElementById('bonuses-live-val')) document.getElementById('bonuses-live-val').innerText = userBonusCount;
    
    btnElement.innerText = "Отримано ✓";
    btnElement.classList.remove('btn-coral', 'btn-navy');
    btnElement.style.background = "var(--badge-green-text)";
    btnElement.style.color = "white";
    
    setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.style.background = "";
        btnElement.classList.add('btn-navy');
    }, 3000);
  } else {
    btnElement.innerText = "Недостатньо";
    btnElement.style.background = "#94a3b8";
    btnElement.style.color = "white";
    setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.style.background = "";
    }, 2000);
  }
}

init();
