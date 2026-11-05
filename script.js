// Автоматичне визначення поточної дати
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const currentDay = now.getDate();

const monthNamesUa = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

// Генерація динамічних дат для ініціатив
function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  const m = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
  return `${day}.${m}.${d.getFullYear()}`;
}

// БАЗА ДАНИХ ІНІЦІАТИВ
const initiatives = [
  { id: 1, title: "Допомога сім'ям з дітьми у Вінниці", category: "Збір речей", city: "Вінниця", format: "Офлайн", date: `До ${getFutureDate(3)}`, targetDate: getFutureDate(3), difficulty: "Легко", image: "photo_2026-11-05_21-09-44.jpg", address: "м. Вінниця, вул. Соборна, 25", coords: [49.232, 28.468] },
  { id: 2, title: "Психологічна підтримка для постраждалих", category: "Психологічна підтримка", city: "Онлайн", format: "Онлайн", date: `До ${getFutureDate(5)}`, targetDate: getFutureDate(5), difficulty: "Середньо", image: "photo_2026-11-05_21-09-47.jpg", address: "Дистанційно (Zoom / Meet)", coords: null },
  { id: 3, title: "Збір продуктів для ВПО", category: "Продукти", city: "Вінниця", format: "Офлайн", date: `До ${getFutureDate(7)}`, targetDate: getFutureDate(7), difficulty: "Легко", image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500", address: "м. Вінниця, Хмельницьке шосе, 14", coords: [49.238, 28.455] },
  { id: 4, title: "Підтримка літніх людей у Вінниці", category: "Допомога людям", city: "Вінниця", format: "Офлайн", date: `До ${getFutureDate(12)}`, targetDate: getFutureDate(12), difficulty: "Складно", image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=500", address: "м. Вінниця, вул. Келецька, 82", coords: [49.225, 28.420] },
  { id: 5, title: "Прибирання територій після обстрілів", category: "Екологія", city: "Вінниця", format: "Офлайн", date: `До ${getFutureDate(15)}`, targetDate: getFutureDate(15), difficulty: "Середньо", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500", address: "м. Вінниця, Замостянський район", coords: [49.245, 28.489] },
  { id: 6, title: "Теплі речі для ВПО", category: "Збір речей", city: "Вінниця", format: "Офлайн", date: `До ${getFutureDate(20)}`, targetDate: getFutureDate(20), difficulty: "Легко", image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500", address: "м. Вінниця, вул. Пирогова, 47", coords: [49.229, 28.450] }
];

// ЗАЯВКИ ВОЛОНТЕРА
let userApplications = JSON.parse(localStorage.getItem('volo_user_apps')) || [
  { id: 1, title: "Допомога сім'ям з дітьми", date: `Вінниця • ${getFutureDate(3)}`, status: "Очікує", img: initiatives[0].image, initId: 1 },
  { id: 2, title: "Збір продуктів для ВПО", date: `Вінниця • ${getFutureDate(7)}`, status: "Підтверджено", img: initiatives[2].image, initId: 3 },
  { id: 3, title: "Психологічна підтримка", date: `Вінниця • ${getFutureDate(5)}`, status: "Підтверджено", img: initiatives[1].image, initId: 2 }
];

function saveApplicationsToStorage() {
  localStorage.setItem('volo_user_apps', JSON.stringify(userApplications));
}

let savedFavIds = JSON.parse(localStorage.getItem('volo_favs')) || [1, 2, 3, 4, 6];
let userBonusCount = parseInt(localStorage.getItem('volo_bonuses')) || 320;
let selectedInitId = 1;
let currentAppFilter = 'all';

let selectedCity = 'Усі міста';
let selectedCategory = 'Усі напрями';
let selectedDiff = 'Будь-яка';
let selectedFormat = 'all';
let selectedDateMode = 'all';
let selectedExactDate = null;

let calViewYear = currentYear;
let calViewMonth = currentMonth;

let leafletMap = null;
let markersLayer = null;
let heroMap = null;
let heroMarkersLayer = null;

// ==========================================
// ЛОГІКА ДЛЯ ОРГАНІЗАТОРА
// ==========================================
let myOrgInitiatives = [
  { id: 101, title: "Збір теплого одягу для ВПО", category: "Збір речей", date: getFutureDate(4), status: "Активна", applicants: 12 },
  { id: 102, title: "Фасування продуктових наборів", category: "Продукти", date: getFutureDate(10), status: "Активна", applicants: 5 },
  { id: 103, title: "Плетіння маскувальних сіток", category: "Допомога людям", date: getFutureDate(-2), status: "Завершена", applicants: 24 }
];

let volunteerApplications = [
  { id: 201, initTitle: "Збір теплого одягу для ВПО", volName: "Олексій Петров", volPhone: "+380 97 111 2233", status: "Очікує" },
  { id: 202, initTitle: "Фасування продуктових наборів", volName: "Марія Іванова", volPhone: "+380 63 444 5566", status: "Очікує" },
  { id: 203, initTitle: "Збір теплого одягу для ВПО", volName: "Іван Сидоров", volPhone: "+380 50 777 8899", status: "Підтверджено" }
];

function updateRoleUI(user) {
  const isOrg = user.role === 'organizer';

  document.querySelectorAll('.vol-only').forEach(el => el.style.display = isOrg ? 'none' : 'flex');
  document.querySelectorAll('.org-only').forEach(el => el.style.display = isOrg ? 'flex' : 'none');

  if (document.getElementById('screen-cabinet').classList.contains('active')) {
    const currentActive = document.querySelector('.cab-nav-item.active');
    if (isOrg && currentActive && currentActive.classList.contains('vol-only')) {
      switchCabTab('org-initiatives');
    } else if (!isOrg && currentActive && currentActive.classList.contains('org-only')) {
      switchCabTab('apps');
    }
  }
}

function renderOrgInitiatives() {
  const list = document.getElementById('org-initiatives-list');
  if (!list) return;

  list.innerHTML = myOrgInitiatives.map(init => {
    const badgeClass = init.status === 'Активна' ? 'status-confirmed' : 'status-done';
    return `
      <div style="background: white; border: 1px solid var(--gray-border); border-radius: var(--radius-md); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span class="tag-badge" style="margin-bottom: 6px;">${init.category}</span>
          <b style="font-size: 16px; display: block; margin-bottom: 4px;">${init.title}</b>
          <div style="font-size: 12px; color: var(--gray-muted);">📅 Дедлайн: ${init.date} • 👥 Заявок: ${init.applicants}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="app-status-badge ${badgeClass}">${init.status}</span>
          <button class="btn-outline" style="padding: 6px 14px; font-size: 12px;" onclick="switchCabTab('org-apps')">Переглянути заявки</button>
        </div>
      </div>
    `;
  }).join('');
}

function handleCreateInitiative(e) {
  e.preventDefault();

  const title = document.getElementById('org-init-title').value;
  const cat = document.getElementById('org-init-cat').value;
  const diff = document.getElementById('org-init-diff').value;
  const city = document.getElementById('org-init-city').value;
  const address = document.getElementById('org-init-address').value;

  const rawDate = document.getElementById('org-init-date').value;
  const dObj = new Date(rawDate);
  const d = dObj.getDate() < 10 ? '0' + dObj.getDate() : dObj.getDate();
  const m = (dObj.getMonth() + 1) < 10 ? '0' + (dObj.getMonth() + 1) : (dObj.getMonth() + 1);
  const formattedDate = `До ${d}.${m}.${dObj.getFullYear()}`;

  const newInit = {
    id: Date.now(),
    title: title,
    category: cat,
    city: city,
    format: document.getElementById('org-init-format').value,
    date: formattedDate,
    targetDate: `${d}.${m}.${dObj.getFullYear()}`,
    difficulty: diff,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500",
    address: address,
    coords: [49.232, 28.468]
  };

  initiatives.unshift(newInit);
  renderMapCards();
  renderHomeCards();
  renderHeroMapMarkers();

  myOrgInitiatives.unshift({
    id: newInit.id,
    title: newInit.title,
    category: newInit.category,
    date: formattedDate,
    status: "Активна",
    applicants: 0
  });

  renderOrgInitiatives();

  const successBox = document.getElementById('org-create-success');
  successBox.style.display = 'block';

  setTimeout(() => {
    successBox.style.display = 'none';
    e.target.reset();
    switchCabTab('org-initiatives');
  }, 2000);
}

function renderOrgApplications() {
  const list = document.getElementById('org-volunteers-list');
  if (!list) return;

  list.innerHTML = volunteerApplications.map(app => {
    const isWaiting = app.status === 'Очікує';
    const badgeClass = isWaiting ? 'status-wait' : 'status-confirmed';

    return `
      <div style="background: white; border: 1px solid var(--gray-border); border-radius: var(--radius-md); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <b style="font-size: 15px; display: block; margin-bottom: 2px;">${app.volName}</b>
          <div style="font-size: 12px; color: var(--gray-muted); margin-bottom: 6px;">📞 ${app.volPhone}</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--dark);">🎯 ${app.initTitle}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="app-status-badge ${badgeClass}">${app.status}</span>
          ${isWaiting ? `
            <button class="btn-coral" style="padding: 6px 14px; font-size: 12px;" onclick="approveVolunteer(${app.id})">Підтвердити ✓</button>
            <button class="btn-outline" style="padding: 6px 14px; font-size: 12px; color: #b91c1c; border-color: #b91c1c;" onclick="rejectVolunteer(${app.id})">Відхилити ✕</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function approveVolunteer(id) {
  const app = volunteerApplications.find(a => a.id === id);
  if (app) app.status = 'Підтверджено';
  renderOrgApplications();
}

function rejectVolunteer(id) {
  volunteerApplications = volunteerApplications.filter(a => a.id !== id);
  renderOrgApplications();
}

// ==========================================
// КОРИСТУВАЧ ТА ПРОФІЛЬ
// ==========================================
function setAuthenticatedUser(user) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
  updateProfileDisplay();
}

function updateProfileDisplay() {
  const user = JSON.parse(localStorage.getItem('currentUser')) || {
    name: '',
    surname: '',
    email: '',
    city: '',
    bio: '',
    phone: '',
    role: 'volunteer'
  };

  const fullName = `${user.name || ''} ${user.surname || ''}`.trim() || 'Користувач';
  const initials = `${(user.name || 'К')[0]}${(user.surname || '')[0] || ''}`.toUpperCase();

  const profileName = document.getElementById('cab-profile-name');
  const profileEmail = document.getElementById('cab-profile-email');
  const sidebarAvatar = document.getElementById('cab-sidebar-avatar');

  if (profileName) profileName.innerText = fullName;
  if (profileEmail) profileEmail.innerText = user.email || 'Увійдіть, щоб переглянути профіль';
  if (sidebarAvatar) sidebarAvatar.innerText = initials;

  const settingsAvatar = document.getElementById('settings-avatar');
  if (settingsAvatar) settingsAvatar.innerText = initials;

  const setName = document.getElementById('set-name');
  const setSurname = document.getElementById('set-surname');
  const setEmail = document.getElementById('set-email');
  const setCity = document.getElementById('set-city');
  const setBio = document.getElementById('set-bio');
  const setPhone = document.getElementById('set-phone');

  if (setName) setName.value = user.name || '';
  if (setSurname) setSurname.value = user.surname || '';
  if (setEmail) setEmail.value = user.email || '';
  if (setCity) setCity.value = user.city || '';
  if (setBio) setBio.value = user.bio || '';
  if (setPhone) setPhone.value = user.phone || '';

  updateRoleUI(user);
}

function init() {
  updateProfileDisplay();
  renderHomeCards();
  initHeroMap();
  renderMapCards();
  renderCabinetApps();
  renderSavedFullGrid();
  renderHistory();
  renderCalendar();

  document.querySelectorAll('#bonuses-live-val, #bonuses-live-val-public').forEach(el => {
    if (el) el.innerText = userBonusCount;
  });

  if (!window.location.hash) {
    history.replaceState({ screen: 'screen-home' }, '', '#home');
  }
  handleHashRouting();
}

// ==========================================
// КАРТА
// ==========================================
function buildPopupHtml(item) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
      <b style="font-size: 14px;">${item.title}</b>
      <div style="font-size: 12px; color: #707b8b; margin: 4px 0;">📍 ${item.address}</div>
      <button onclick="openDetailView(${item.id})" style="background: #e65135; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; width: 100%;">Детальніше</button>
    </div>
  `;
}

function initHeroMap() {
  const el = document.getElementById('hero-map-container');
  if (!el || heroMap) return;

  heroMap = L.map(el, {
  scrollWheelZoom: false,   // щоб карта не перехоплювала прокрутку сторінки
  zoomControl: false
}).setView([49.2331, 28.4682], 12);
L.control.zoom({ position: 'bottomright' }).addTo(heroMap);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
  }).addTo(heroMap);

  heroMarkersLayer = L.layerGroup().addTo(heroMap);
  renderHeroMapMarkers();
}

function renderHeroMapMarkers() {
  if (!heroMarkersLayer) return;
  heroMarkersLayer.clearLayers();

  initiatives.forEach(item => {
    if (item.coords) {
      L.marker(item.coords).addTo(heroMarkersLayer).bindPopup(buildPopupHtml(item));
    }
  });
}
function initRealMap() {
  if (leafletMap) {
    leafletMap.invalidateSize();
    return;
  }

  leafletMap = L.map('real-map-container').setView([49.2331, 28.4682], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
  }).addTo(leafletMap);

  markersLayer = L.layerGroup().addTo(leafletMap);
  renderMapCards();
}

function updateMapMarkers(filteredInitiatives) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  filteredInitiatives.forEach(item => {
    if (item.coords) {
      const marker = L.marker(item.coords).addTo(markersLayer);
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <b style="font-size: 14px;">${item.title}</b>
          <div style="font-size: 12px; color: #707b8b; margin: 4px 0;">📍 ${item.address}</div>
          <button onclick="openDetailView(${item.id})" style="background: #e65135; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; width: 100%;">Детальніше</button>
        </div>
      `);
    }
  });
}

// ==========================================
// БОНУСИ
// ==========================================
function redeemDiscount(btnElement, cost) {
  if (!btnElement.dataset.defaultText) {
    btnElement.dataset.defaultText = btnElement.innerText;
  }
  const defaultText = btnElement.dataset.defaultText;

  if (userBonusCount >= cost) {
    userBonusCount -= cost;
    localStorage.setItem('volo_bonuses', userBonusCount);
    document.querySelectorAll('#bonuses-live-val, #bonuses-live-val-public').forEach(el => el.innerText = userBonusCount);

    btnElement.innerText = "Отримано ✓";
    const ogBg = btnElement.style.background;
    btnElement.style.background = "var(--badge-green-text)";
    btnElement.style.color = "white";

    setTimeout(() => {
      btnElement.innerText = defaultText;
      btnElement.style.background = ogBg;
      btnElement.style.color = "";
    }, 2000);
  } else {
    btnElement.innerText = `Недостатньо (${userBonusCount}/${cost})`;
    const ogBg = btnElement.style.background;
    btnElement.style.background = "#e65135";
    btnElement.style.color = "white";

    setTimeout(() => {
      btnElement.innerText = defaultText;
      btnElement.style.background = ogBg;
      btnElement.style.color = "";
    }, 2000);
  }
}

function copyReferralLink(btn) {
  const user = JSON.parse(localStorage.getItem('currentUser')) || { name: 'user' };
  const rawName = (user.name || 'user').toLowerCase().trim();
  const slug = encodeURIComponent(rawName);
  const refLink = `https://volomap.ua/ref/${slug}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(refLink);
  } else {
    const ta = document.createElement('textarea');
    ta.value = refLink;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  if (!btn.dataset.defaultText) {
    btn.dataset.defaultText = btn.innerText;
  }
  const ogText = btn.dataset.defaultText;
  btn.innerText = "Скопійовано ✓";
  btn.style.borderColor = "var(--badge-green-text)";
  btn.style.color = "var(--badge-green-text)";

  setTimeout(() => {
    btn.innerText = ogText;
    btn.style.borderColor = "";
    btn.style.color = "";
  }, 2500);
}

// ==========================================
// КАЛЕНДАР
// ==========================================
function renderCalendar() {
  const labelHeader = document.getElementById('label-date-val');
  const monthTitle = document.getElementById('cal-month-year-title');

  if (monthTitle) {
    monthTitle.innerText = `${monthNamesUa[calViewMonth]} ${calViewYear}`;
  }

  if (labelHeader && selectedDateMode === 'all') {
    labelHeader.innerText = `${monthNamesUa[calViewMonth]} ${calViewYear}`;
  }

  const grid = document.getElementById('calendar-days-mock');
  if (!grid) return;

  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(calViewYear, calViewMonth, 1).getDay() + 6) % 7;

  let html = '';
  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = (day === currentDay && calViewMonth === currentMonth && calViewYear === currentYear);
    const dateStr = `${day < 10 ? '0' + day : day}.${(calViewMonth + 1) < 10 ? '0' + (calViewMonth + 1) : (calViewMonth + 1)}.${calViewYear}`;
    const isSelected = (selectedDateMode === 'exact' && selectedExactDate === dateStr);

    let style = "width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto; cursor: pointer; border-radius: 50%; font-size: 12px;";
    if (isSelected) {
      style += "background: var(--primary); color: white; font-weight: 800;";
    } else if (isToday) {
      style += "border: 1px solid var(--primary); color: var(--primary); font-weight: 700;";
    }

    html += `<div style="${style}" onclick="selectExactCalendarDay(${day})">${day}</div>`;
  }

  grid.innerHTML = html;
}

function calPrevMonth(e) {
  e.stopPropagation();
  calViewMonth--;
  if (calViewMonth < 0) {
    calViewMonth = 11;
    calViewYear--;
  }
  renderCalendar();
}

function calNextMonth(e) {
  e.stopPropagation();
  calViewMonth++;
  if (calViewMonth > 11) {
    calViewMonth = 0;
    calViewYear++;
  }
  renderCalendar();
}

function selectExactCalendarDay(day) {
  const m = (calViewMonth + 1) < 10 ? '0' + (calViewMonth + 1) : (calViewMonth + 1);
  const d = day < 10 ? '0' + day : day;
  selectedExactDate = `${d}.${m}.${calViewYear}`;
  selectedDateMode = 'exact';

  document.getElementById('label-date-val').innerText = selectedExactDate;
  renderCalendar();
  closeAllDropdownMenus();
  renderMapCards();
}

function chooseDateFilter(mode) {
  selectedDateMode = mode;
  const labelHeader = document.getElementById('label-date-val');

  if (mode === 'today') {
    const d = currentDay < 10 ? '0' + currentDay : currentDay;
    const m = (currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1);
    selectedExactDate = `${d}.${m}.${currentYear}`;
    labelHeader.innerText = "Сьогодні";
  } else if (mode === 'week') {
    labelHeader.innerText = "Цього тижня";
  } else if (mode === 'month') {
    labelHeader.innerText = "Цього місяця";
  } else if (mode === 'all') {
    selectedExactDate = null;
    labelHeader.innerText = `${monthNamesUa[calViewMonth]} ${calViewYear}`;
  }

  renderCalendar();
  closeAllDropdownMenus();
  renderMapCards();
}

function renderMapCards() {
  const container = document.getElementById('map-cards-list');
  if (!container) return;

  const filtered = initiatives.filter(item => {
    const c1 = selectedCity === 'Усі міста' || item.city === selectedCity;
    const c2 = selectedCategory === 'Усі напрями' || item.category === selectedCategory;
    const c3 = selectedDiff === 'Будь-яка' || item.difficulty === selectedDiff;
    const c4 = selectedFormat === 'all' || item.format === selectedFormat;

    let c5 = true;
    if (selectedDateMode === 'exact' && selectedExactDate) {
      c5 = item.targetDate >= selectedExactDate;
    }

    return c1 && c2 && c3 && c4 && c5;
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
          <div style="position: absolute; top: 0; right: 0; color: ${heartColor}; font-size: 16px;">❤</div>
          <span class="tag-badge">${item.category}</span>
          <div style="font-size: 14px; font-weight: 800; line-height: 1.25; margin: 2px 0; padding-right: 16px;">${item.title}</div>
          <div style="font-size: 11px; color: var(--gray-muted);">📍 ${item.city} • 📅 ${item.date}</div>
          <div style="font-size: 11px; margin-top: 4px;">Складність: <b>${item.difficulty}</b></div>
        </div>
      </div>
    `;
  }).join('');

  updateMapMarkers(filtered);
}

// ==========================================
// НАВІГАЦІЯ
// ==========================================
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

  if (screenId === 'screen-map') {
    setTimeout(initRealMap, 100);
  }

  // ⬇⬇⬇ ДОДАЙ ЦЕ ⬇⬇⬇
  if (screenId === 'screen-home') {
    setTimeout(() => {
      if (heroMap) heroMap.invalidateSize();
    }, 100);
  }
  // ⬆⬆⬆ кінець нового коду ⬆⬆⬆
}

window.addEventListener('popstate', () => handleHashRouting());

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
    if (id) openDetailView(id, false);
  } else {
    showScreen('screen-home');
  }
}

// ==========================================
// ФІЛЬТРИ
// ==========================================
function toggleDropdownMenu(menuId) {
  const menu = document.getElementById(menuId);
  const isOpen = menu.classList.contains('open');
  closeAllDropdownMenus();

  if (!isOpen) {
    menu.classList.add('open');
    if (menuId === 'menu-city') {
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
  document.getElementById('search-city-input').value = '';
  filterCityDropdown('');
  renderMapCards();
}

function filterCityDropdown(search) {
  const term = search.toLowerCase().trim();

  document.querySelectorAll('#city-options-container .dropdown-option').forEach(opt => {
    const rawText = opt.innerText.replace('✓', '').trim();
    opt.style.display = (term === '' || rawText.toLowerCase().includes(term)) ? 'flex' : 'none';
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

// ==========================================
// ГОЛОВНА ТА ДЕТАЛІ ІНІЦІАТИВ
// ==========================================
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
    applyBtn.onclick = () => {
      navigateTo('screen-cabinet');
      switchCabTab('apps');
    };
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

function goToApplyCurrent() {
  const item = initiatives.find(i => i.id === selectedInitId) || initiatives[0];

  document.getElementById('form-initiative').value = item.title;
  document.getElementById('form-city').value = item.city;
  document.getElementById('form-date').value = item.date.replace('До ', '');
  document.getElementById('form-address').value = item.address;

  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (user) {
    document.getElementById('form-name').value = `${user.name} ${user.surname}`;
    document.getElementById('form-email').value = user.email;
    if (user.phone) document.getElementById('form-phone').value = user.phone;
  }

  document.getElementById('apply-lead-text').innerText = 'Заповни форму, щоб долучитися до ініціативи';
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

  if (document.getElementById('screen-map').classList.contains('active')) {
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

// ==========================================
// УСПІШНЕ НАДСИЛАННЯ ЗАЯВКИ
// ==========================================
window.onSuccessfulFirebaseSubmit = function() {
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

  saveApplicationsToStorage();

  userBonusCount += 50;
  localStorage.setItem('volo_bonuses', userBonusCount);

  document.querySelectorAll('#bonuses-live-val, #bonuses-live-val-public').forEach(el => {
    el.innerText = userBonusCount;
  });

  document.getElementById("apply-form").style.display = "none";
  document.getElementById("apply-lead-text").style.display = "none";
  document.getElementById('apply-success-box').style.display = 'block';

  setTimeout(() => {
    renderCabinetApps();
    navigateTo('screen-cabinet');
    switchCabTab('apps');

    document.getElementById("apply-form").style.display = "block";
    document.getElementById("apply-lead-text").style.display = "block";
    document.getElementById('apply-success-box').style.display = 'none';
  }, 1500);
};

// ==========================================
// ОСОБИСТИЙ КАБІНЕТ
// ==========================================
function switchCabTab(tab) {
  document.querySelectorAll('.cab-pane-view').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.cab-nav-item').forEach(b => b.classList.remove('active'));

  if (tab === 'apps') {
    document.getElementById('cab-pane-apps').style.display = 'block';
    if (document.getElementById('tab-btn-apps')) document.getElementById('tab-btn-apps').classList.add('active');
  } else if (tab === 'favs') {
    document.getElementById('cab-pane-favs').style.display = 'block';
    if (document.getElementById('tab-btn-favs')) document.getElementById('tab-btn-favs').classList.add('active');
  } else if (tab === 'history') {
    document.getElementById('cab-pane-history').style.display = 'block';
    if (document.getElementById('tab-btn-history')) document.getElementById('tab-btn-history').classList.add('active');
  } else if (tab === 'hours') {
    document.getElementById('cab-pane-hours').style.display = 'block';
    if (document.getElementById('tab-btn-hours')) document.getElementById('tab-btn-hours').classList.add('active');
  } else if (tab === 'bonuses') {
    document.getElementById('cab-pane-bonuses').style.display = 'block';
    if (document.getElementById('tab-btn-bonuses')) document.getElementById('tab-btn-bonuses').classList.add('active');
  } else if (tab === 'settings') {
    document.getElementById('cab-pane-settings').style.display = 'block';
    if (document.getElementById('tab-btn-settings')) document.getElementById('tab-btn-settings').classList.add('active');
  } else if (tab === 'org-initiatives') {
    document.getElementById('cab-pane-org-initiatives').style.display = 'block';
    if (document.getElementById('tab-btn-org-initiatives')) document.getElementById('tab-btn-org-initiatives').classList.add('active');
    renderOrgInitiatives();
  } else if (tab === 'org-create') {
    document.getElementById('cab-pane-org-create').style.display = 'block';
    if (document.getElementById('tab-btn-org-create')) document.getElementById('tab-btn-org-create').classList.add('active');
  } else if (tab === 'org-apps') {
    document.getElementById('cab-pane-org-apps').style.display = 'block';
    if (document.getElementById('tab-btn-org-apps')) document.getElementById('tab-btn-org-apps').classList.add('active');
    renderOrgApplications();
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
  saveApplicationsToStorage();
  renderCabinetApps();
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
    { title: "Допомога сім'ям з дітьми", date: getFutureDate(-2), hours: "+4 год", loc: "м. Вінниця, вул. Соборна", img: initiatives[0].image, id: 1 },
    { title: "Підтримка літніх людей у Вінниці", date: getFutureDate(-5), hours: "+6 год", loc: "м. Вінниця, вул. Соборна", img: initiatives[3].image, id: 4 },
    { title: "Прибирання території", date: getFutureDate(-8), hours: "+4 год", loc: "м. Вінниця, вул. Соборна", img: initiatives[4].image, id: 5 }
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

// ==========================================
// РЕЄСТРАЦІЯ, АВТОРИЗАЦІЯ ТА ПРОФІЛЬ
// ==========================================
function showAuthMessage(type, message, isError = true) {
  const boxId = type === 'register' ? 'register-message' : 'login-message';
  const box = document.getElementById(boxId);

  if (!box) return;

  box.textContent = message;
  box.style.display = 'block';
  box.style.color = isError ? '#b91c1c' : '#15803d';
  box.style.background = isError ? '#fef2f2' : '#f0fdf4';
}

function getFirebaseErrorMessage(error) {
  const code = error && error.code ? error.code : '';

  const messages = {
    'auth/email-already-in-use': 'Цей email уже зареєстрований. Увійдіть у свій акаунт.',
    'auth/invalid-email': 'Введіть коректну адресу електронної пошти.',
    'auth/weak-password': 'Пароль має містити щонайменше 6 символів.',
    'auth/invalid-credential': 'Неправильний email або пароль.',
    'auth/user-not-found': 'Акаунт із таким email не знайдено.',
    'auth/wrong-password': 'Неправильний пароль.',
    'auth/too-many-requests': 'Забагато спроб. Спробуйте пізніше.',
    'auth/network-request-failed': 'Немає з’єднання з інтернетом. Перевірте мережу.',
    'permission-denied': 'Firebase відхилив запис. Перевірте правила доступу Firestore.',
    'auth/popup-closed-by-user': 'Вікно входу Google було закрито.'
  };

  return messages[code] || (error && error.message) || 'Сталася невідома помилка. Перевірте консоль браузера.';
}

async function handleRegistration(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const button = form.querySelector('button[type="submit"]');

  const firstName = document.getElementById('reg-name').value.trim();
  const lastName = document.getElementById('reg-surname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const city = document.getElementById('reg-city').value;
  const password = document.getElementById('reg-password').value;
  const roleInput = document.querySelector('input[name="role"]:checked');

  if (!roleInput) {
    showAuthMessage('register', 'Оберіть тип акаунта.');
    return;
  }

  if (!window.firebaseRegister) {
    showAuthMessage('register', 'Firebase ще завантажується. Оновіть сторінку та спробуйте ще раз.');
    return;
  }

  const profile = {
    name: firstName,
    surname: lastName,
    email: email,
    phone: phone,
    city: city,
    role: roleInput.value,
    bio: ''
  };

  button.disabled = true;
  button.textContent = 'Створення акаунта...';

  const box = document.getElementById('register-message');
  if (box) box.style.display = 'none';

  try {
    const savedProfile = await window.firebaseRegister(profile, password);
    setAuthenticatedUser(savedProfile);
    form.reset();
    navigateTo('screen-cabinet');
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    showAuthMessage('register', getFirebaseErrorMessage(error));
  } finally {
    button.disabled = false;
    button.textContent = 'Зареєструватися →';
  }
}

async function handleLogin(e) {
  if (e) e.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const form = document.getElementById('login-form');
  const button = form ? form.querySelector('button[type="submit"]') : null;

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!window.firebaseLogin) {
    showAuthMessage('login', 'Firebase ще завантажується. Оновіть сторінку та спробуйте ще раз.');
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Вхід...';
  }

  const box = document.getElementById('login-message');
  if (box) box.style.display = 'none';

  try {
    const profile = await window.firebaseLogin(email, password);
    setAuthenticatedUser(profile);
    navigateTo('screen-cabinet');
  } catch (error) {
    console.error('Помилка входу:', error);
    showAuthMessage('login', getFirebaseErrorMessage(error));
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Увійти →';
    }
  }
}

async function handleGoogleLogin() {
  if (!window.firebaseGoogleLogin) {
    showAuthMessage('login', 'Firebase ще завантажується. Оновіть сторінку та спробуйте ще раз.');
    return;
  }

  try {
    const profile = await window.firebaseGoogleLogin();
    setAuthenticatedUser(profile);
    navigateTo('screen-cabinet');
  } catch (error) {
    console.error('Помилка входу через Google:', error);
    showAuthMessage('login', getFirebaseErrorMessage(error));
  }
}

async function handlePasswordReset(emailOverride) {
  const email = (emailOverride || document.getElementById('login-email').value).trim();

  if (!email) {
    showAuthMessage('login', 'Спочатку введіть email, на який надіслати посилання для відновлення пароля.');
    return;
  }

  try {
    await window.firebaseResetPassword(email);
    showAuthMessage('login', 'Посилання для відновлення пароля надіслано на вашу пошту.', false);
  } catch (error) {
    console.error('Помилка відновлення пароля:', error);
    showAuthMessage('login', getFirebaseErrorMessage(error));
  }
}

async function handleLogout() {
  try {
    await window.firebaseLogout();
    setAuthenticatedUser(null);
    navigateTo('screen-home');
  } catch (error) {
    console.error('Помилка виходу:', error);
    alert(getFirebaseErrorMessage(error));
  }
}

async function saveProfileSettings(e) {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!user || !window.firebaseSaveProfile) {
    alert('Спочатку увійдіть у свій акаунт.');
    return;
  }

  const updatedUser = {
    ...user,
    name: document.getElementById('set-name').value.trim(),
    surname: document.getElementById('set-surname').value.trim(),
    city: document.getElementById('set-city').value.trim(),
    bio: document.getElementById('set-bio').value.trim(),
    phone: document.getElementById('set-phone').value.trim()
  };

  const button = e.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Збереження...';

  try {
    const savedProfile = await window.firebaseSaveProfile(updatedUser);
    setAuthenticatedUser(savedProfile);

    const box = document.getElementById('settings-success-box');
    box.textContent = 'Профіль успішно збережено у Firebase!';
    box.style.display = 'block';

    setTimeout(() => box.style.display = 'none', 3000);
  } catch (error) {
    console.error('Помилка збереження профілю:', error);
    alert(getFirebaseErrorMessage(error));
  } finally {
    button.disabled = false;
    button.textContent = 'Зберегти зміни';
  }
}

// ==========================================
// КОНТАКТНА ФОРМА
// ==========================================
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

// ==========================================
// МОДАЛЬНІ ВІКНА
// ==========================================
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

init();
