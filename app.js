// --- DANE SZKOLEŃ I TRENINGÓW ---
const trainings = [
  { id: 'bhp', name: 'Szkolenie BHP', type: 'exam' },
  { id: 'ppoz', name: 'Szkolenie PPOŻ', type: 'exam' },
  { id: 'influencer', name: ' INFLUENCER', type: 'training' },
  { id: 'ergonomia', name: 'Trening Ergonomia pracy', type: 'training' }
];

// --- PRZYPISANIE DO UŻYTKOWNIKÓW ---
// Tutaj w kodzie decydujesz, które szkolenia/treningi przypisujesz do kogo
const userTrainings = {
  justyna: ['bhp', 'ergonomia'],      // Justyna Jankowska
  klaudia: ['ppoz', 'influencer']     // Klaudia Pierzak
};

// --- PYTANIA DO EGZAMINÓW ---
const examQuestions = {
  bhp: [
    { q: "Ile minut trwa przerwa po 6h pracy?", a: ["10", "15", "30"], correct: 1 },
    { q: "Co robisz w razie pożaru?", a: ["Uciekasz", "Zgłaszasz i ewakuujesz się", "Ignorujesz"], correct: 1 },
    { q: "Kask ochronny nosimy:", a: ["Na głowie", "Na ręku", "Na nogach"], correct: 0 }
  ],
  ppoz: [
    { q: "Numer alarmowy straży pożarnej to?", a: ["911", "998", "997"], correct: 1 },
    { q: "Gaśnicę proszkową stosujemy do:", a: ["Ciekłych i gazów", "Wszystkich rodzajów pożarów", "Tylko drewna"], correct: 1 },
    { q: "Co robimy widząc ogień?", a: ["Ukrywamy się", "Zgłaszamy i używamy gaśnicy", "Czekamy"], correct: 1 }
  ]
};

// --- TREŚĆ TRENINGÓW ---
const trainingContent = {
  influencer: `
    <h3>INFLUENCER - Szkolenie podstawowe</h3>
    <p>1. Planowanie i harmonogram

Tworzenie tygodniowego kalendarza postów.

Określenie częstotliwości publikacji (np. jeden post na Instagramie codziennie, 7 stories codziennie, 7 postów na X). W planowaniu pomoże ci aplikacja Planner na telefon, która ma wszystkie twoje zadania na dzisjeszy dzień w jednym miejscu. Administrator aplikacji może w każdym momencie dodać lub usunąć jakieś zadania.
</p>
<p><img src="przyklad.png" alt="Planowanie i harmonogram" style="display:block; margin:20px auto; max-width:300px; border:2px solid #ff69b4; border-radius:10px;" /></p>
<p>2. Wyznaczenie tematów przewodnich (fitness, dzisiejszy film, zakupy ubrań itp.).</p>
<p>W każdym dniu pomyśl co będziesz robiła i czym będziesz się dzielić ze swoimi widzami, pamiętaj nie możesz podawać im cały czas tego samego odgrzewanego kotleta, widzowie pragną nowości dlatego czasami tematem przewodnim może być to, że robisz trening, relacja z treningu, zdjęcie, może fit jedzonko, później coś innego, zawsze trzeba zmieniać i MIXować tematy, aby widz czuł się zaopiekowany.</p>
    <p><img src="pazy.png" alt="Mix" style="display:block; margin:20px auto; max-width:300px; border:2px solid #ff69b4; border-radius:10px;" /></p>
  `,
  ergonomia: `
    <h3>Trening: Ergonomia pracy</h3>
    <p>Dowiesz się jak ustawić stanowisko pracy poprawnie.</p>
    <p>Możesz tu dodać zdjęcia lub filmiki instruktażowe.</p>
  `
};

// --- STAN APLIKACJI ---
let currentUser = null;
let currentTrainingId = null;

// --- ELEMENTY DOM ---
const welcomeScreen = document.getElementById("welcome-screen");
const dashboard = document.getElementById("dashboard");
const examScreen = document.getElementById("exam-screen");
const resultScreen = document.getElementById("result-screen");
const trainingScreen = document.getElementById("training-screen");

const userSelect = document.getElementById("userSelect");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usernameSpan = document.getElementById("username");

const trainingList = document.getElementById("trainingList");
const resultsList = document.getElementById("resultsList");

const examForm = document.getElementById("examForm");
const submitExamBtn = document.getElementById("submitExamBtn");
const cancelExamBtn = document.getElementById("cancelExamBtn");
const examTrainingName = document.getElementById("examTrainingName");

const examResult = document.getElementById("examResult");
const backToDashboardBtn = document.getElementById("backToDashboardBtn");

const trainingTitle = document.getElementById("trainingTitle");
const trainingContentDiv = document.getElementById("trainingContent");
const finishTrainingBtn = document.getElementById("finishTrainingBtn");

// --- FUNKCJE POMOCNICZE ---
function getUserName(userId) {
  const opt = userSelect.querySelector(`option[value="${userId}"]`);
  return opt ? opt.textContent : userId;
}

function getTrainingName(id) {
  const t = trainings.find(x => x.id === id);
  return t ? t.name : 'Szkolenie';
}

function showScreen(screen) {
  [welcomeScreen, dashboard, examScreen, resultScreen, trainingScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// --- LOGOWANIE ---
loginBtn.addEventListener('click', () => {
  const userId = userSelect.value;
  if (!userId) { alert("Wybierz użytkownika!"); return; }
  currentUser = userId;
  localStorage.setItem('currentUser', userId);
  loadDashboard();
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showScreen(welcomeScreen);
});

// --- PANEL UŻYTKOWNIKA ---
function loadDashboard() {
  usernameSpan.textContent = getUserName(currentUser);
  trainingList.innerHTML = '';
  resultsList.innerHTML = '';

  const allowedTrainings = userTrainings[currentUser] || [];

  trainings.forEach(t => {
    if (!allowedTrainings.includes(t.id)) return;

    const li = document.createElement('li');
    const left = document.createElement('div');
    left.textContent = t.name;

    const btn = document.createElement('button');
    btn.type = 'button';

    if (t.type === 'exam') {
      btn.textContent = 'Rozpocznij egzamin';
      btn.addEventListener('click', () => startExam(t.id));
    } else {
      btn.textContent = 'Rozpocznij trening';
      btn.addEventListener('click', () => startTraining(t.id));
    }

    li.appendChild(left);
    li.appendChild(btn);
    trainingList.appendChild(li);
  });

  // Historia wyników
  const resultsKey = `${currentUser}-results`;
  const results = JSON.parse(localStorage.getItem(resultsKey) || '[]');

  if (results.length === 0) {
    const li = document.createElement('li');
    li.textContent = '(brak wyników)';
    resultsList.appendChild(li);
  } else {
    results.forEach(r => {
      const li = document.createElement('li');
      const name = r.trainingName || getTrainingName(r.trainingId);
      if (r.score !== undefined) {
        li.textContent = `${name} — ${r.score}/${examQuestions[r.trainingId].length} → ${r.passed ? 'Zdane ✅' : 'Nie zdane ❌'} (${new Date(r.date).toLocaleString()})`;
      } else {
        li.textContent = `${name} → Ukończono ✅ (${new Date(r.date).toLocaleString()})`;
      }
      resultsList.appendChild(li);
    });
  }

  showScreen(dashboard);
}

// --- EGZAMINY ---
function startExam(trainingId) {
  currentTrainingId = trainingId;
  examTrainingName.textContent = getTrainingName(trainingId);
  examForm.innerHTML = '';

  const questions = examQuestions[trainingId] || [];
  questions.forEach((q, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-question';
    const p = document.createElement('p');
    p.textContent = `${i+1}. ${q.q}`;
    wrapper.appendChild(p);

    q.a.forEach((ans, idx) => {
      const id = `q${i}_a${idx}`;
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${i}`;
      input.value = idx;
      input.id = id;

      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = ans;

      wrapper.appendChild(input);
      wrapper.appendChild(label);
      wrapper.appendChild(document.createElement('br'));
    });

    examForm.appendChild(wrapper);
  });

  showScreen(examScreen);
}

submitExamBtn.addEventListener('click', () => {
  const questions = examQuestions[currentTrainingId] || [];
  let score = 0;
  let unanswered = 0;

  questions.forEach((q, i) => {
    const sel = document.querySelector(`input[name="q${i}"]:checked`);
    if (!sel) unanswered++;
    else if (parseInt(sel.value, 10) === q.correct) score++;
  });

  if (unanswered > 0) {
    const proceed = confirm(`Nie odpowiedziałeś na ${unanswered} pytanie(a). Chcesz zakończyć egzamin i zapisać wynik?`);
    if (!proceed) return;
  }

  const passed = score >= Math.ceil(questions.length * 0.7);
  saveResult({ trainingId: currentTrainingId, score, passed });

  examResult.textContent = `Twój wynik: ${score}/${questions.length} → ${passed ? 'Zdane ✅' : 'Nie zdane ❌'}`;
  showScreen(resultScreen);
});

cancelExamBtn.addEventListener('click', loadDashboard);
backToDashboardBtn.addEventListener('click', loadDashboard);

// --- TRENING ---
function startTraining(trainingId) {
  currentTrainingId = trainingId;
  trainingTitle.textContent = getTrainingName(trainingId);
  trainingContentDiv.innerHTML = trainingContent[trainingId] || "<p>Brak treści treningu.</p>";
  showScreen(trainingScreen);
}

finishTrainingBtn.addEventListener('click', () => {
  saveResult({ trainingId: currentTrainingId, passed: true });
  alert("Trening ukończony!");
  loadDashboard();
});

// --- ZAPIS WYNIKU ---
function saveResult(obj) {
  const resultsKey = `${currentUser}-results`;
  const old = JSON.parse(localStorage.getItem(resultsKey) || '[]');

  const resultObj = {
    trainingId: obj.trainingId,
    trainingName: getTrainingName(obj.trainingId),
    score: obj.score,
    passed: obj.passed,
    date: new Date().toISOString()
  };

  old.push(resultObj);
  localStorage.setItem(resultsKey, JSON.stringify(old));
}

// --- AUTOLOGIN ---
window.addEventListener('load', () => {
  const saved = localStorage.getItem('currentUser');
  if (saved && userSelect.querySelector(`option[value="${saved}"]`)) {
    userSelect.value = saved;
    currentUser = saved;
    loadDashboard();
  } else {
    showScreen(welcomeScreen);
  }
});
