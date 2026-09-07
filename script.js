const seminarDates = [
  { id: '2026-10-30', label: '30.10.2026' },
  { id: '2026-11-20', label: '20.11.2026' },
  { id: '2026-12-11', label: '11.12.2026' },
  { id: '2027-01-22', label: '22.1.2027' },
  { id: '2027-03-05', label: '5.3.2027' },
  { id: '2027-04-23', label: '23.4.2027' },
  { id: '2027-05-07', label: '7.5.2027' }
];

const phaseDefinitions = [
  {
    id: 'aihe',
    number: 1,
    title: 'Aihe & rajaus',
    subtitle: 'Noin 16 vk ennen päätöstä',
    color: 'orange',
    startOffsetWeeks: 18,
    endOffsetWeeks: 16,
    tasks: [
      'Tunnista ratkaistava ongelma',
      'Tee aiheen rajaus ja määritä tavoite',
      'Aihe-ehdotus Wihin'
    ],
    badge: 'Hyväksytty aihe'
  },
  {
    id: 'suunnittelu',
    number: 2,
    title: 'Suunnittelu',
    subtitle: 'Noin 15–13 vk ennen',
    color: 'purple',
    startOffsetWeeks: 15,
    endOffsetWeeks: 13,
    tasks: [
      'Tutki ja määrittele tietoperusta ja keskeiset lähteet',
      'Menetelmät ja aikataulu',
      'Pidä aloituspalaveri'
    ],
    badge: 'Hyväksytty suunnitelma'
  },
  {
    id: 'toteutus',
    number: 3,
    title: 'Toteutus',
    subtitle: 'Noin 12–5 vk ennen',
    color: 'cyan',
    startOffsetWeeks: 12,
    endOffsetWeeks: 5,
    tasks: [
      'Tutki tai kehitä ratkaisu',
      'Testaa ja analysoi',
      'Kirjoita raporttia koko ajan'
    ],
    badge: 'Toteutus + lähes valmis raportti'
  },
  {
    id: 'viimeistely',
    number: 4,
    title: 'Viimeistely',
    subtitle: 'Noin 4–2 vk ennen',
    color: 'lime',
    startOffsetWeeks: 4,
    endOffsetWeeks: 2,
    tasks: [
      'Kirjoita tulokset ja johtopäätökset',
      'Tiivistelmä ja abstrakti',
      'Tarkista lähteet, viitteet ja kuvat',
      'Lähetä raportti ohjaajalle tarkistettavaksi',
      'Tee tarvittavat korjaukset ja viimeistele raportti'
    ],
    badge: 'Arvioitu ja arvioitu työ'
  },
  {
    id: 'paatos',
    number: 5,
    title: 'Päätösvaihe',
    subtitle: 'Noin 2 vk ennen ->',
    color: 'blue',
    startOffsetWeeks: 2,
    endOffsetWeeks: 0,
    tasks: [
      'Varaa aika päättöseminaariin',
      'Päätösseminaarin valmistelu',
      'plagioinnin tarkistus',
      'työn julkaisu Theseukseen'
    ],
    badge: 'Loppuseminaari'
  }
];

const selectEl = document.getElementById('seminarSelect');
const timelineEl = document.getElementById('timeline');
const printButtonEl = document.getElementById('printButton');

function addDay(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date) {
  const formatter = new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  return formatter.format(date);
}

function getCommunicationReviewDate(seminarDate) {
  return addDay(new Date(`${seminarDate}T10:30:00`), -21);
}

function getRegistrationDeadline(seminarDate) {
  const previousWeek = addDay(new Date(`${seminarDate}T09:00:00`), -7);
  const daysSinceThursday = (previousWeek.getDay() - 4 + 7) % 7;
  return addDay(previousWeek, -daysSinceThursday);
}

function formatDateTime(date) {
  return `${formatDate(date)} klo ${new Intl.DateTimeFormat('fi-FI', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)}`;
}

function getPhaseTasks(phase, seminarDate) {
  const tasks = phase.tasks.map((text) => ({ text }));

  if (phase.id === 'viimeistely') {
    const communicationReviewDate = formatDate(getCommunicationReviewDate(seminarDate));
    const deadline = `3 vk ennen loppuseminaaria: ${communicationReviewDate}`;

    tasks.push(
      { text: 'Lähetä valmis raportti viestinnän tarkistukseen', deadline },
      { text: 'Lähetä abstrakti viestinnän tarkistukseen', deadline }
    );
  }

  return tasks;
}

function getDateRange(seminarDate, startOffsetWeeks, endOffsetWeeks) {
  const seminar = new Date(`${seminarDate}T10:30:00`);
  const start = addDay(seminar, -(startOffsetWeeks * 7));
  const end = addDay(seminar, -(endOffsetWeeks * 7));

  if (start.getTime() === end.getTime()) {
    return {
      start,
      end,
      label: `alkaen ${formatDate(start)}`
    };
  }

  return {
    start,
    end,
    label: `${formatDate(start)} – ${formatDate(end)}`
  };
}

function generatePlanningMeeting(seminarDate) {
  const seminar = new Date(`${seminarDate}T10:30:00`);
  const phaseEnd = addDay(seminar, -(13 * 7));
  return [addDay(phaseEnd, 3)];
}

function generateImplementationMeetings(seminarDate) {
  const seminar = new Date(`${seminarDate}T10:30:00`);
  const phaseStart = addDay(seminar, -(12 * 7));
  const phaseEnd = addDay(seminar, -(5 * 7));
  const meetings = [];
  let cursor = new Date(phaseStart);

  while (cursor < phaseEnd) {
    meetings.push(new Date(cursor));
    cursor = addDay(cursor, 21);
  }

  const last = meetings[meetings.length - 1];
  if (!last || last > phaseEnd) {
    meetings.push(new Date(phaseEnd));
  }

  return meetings.filter((date) => date >= phaseStart && date <= phaseEnd);
}

function generateFinalReviewMeeting(seminarDate, implementationMeetings) {
  const seminar = new Date(`${seminarDate}T10:30:00`);
  const phaseWindowStart = addDay(seminar, -(4 * 7));
  const phaseWindowEnd = addDay(seminar, -(2 * 7));
  const candidate = addDay(seminar, -7);

  const lastImplementation = implementationMeetings.length
    ? implementationMeetings[implementationMeetings.length - 1]
    : null;

  let selected = candidate;

  if (lastImplementation && lastImplementation > phaseWindowStart) {
    selected = addDay(lastImplementation, 7);
  }

  if (selected < phaseWindowStart || selected > phaseWindowEnd) {
    selected = candidate;
  }

  return [selected];
}

function generatePostSeminarMeeting(seminarDate) {
  const seminar = new Date(`${seminarDate}T10:30:00`);
  return [addDay(seminar, 7)];
}

function getGuidanceMeetingsForPhase(seminarDate, phaseId) {
  const implementationMeetings = generateImplementationMeetings(seminarDate);

  switch (phaseId) {
    case 'suunnittelu':
      return generatePlanningMeeting(seminarDate);
    case 'toteutus':
      return implementationMeetings;
    case 'viimeistely':
      return generateFinalReviewMeeting(seminarDate, implementationMeetings);
    case 'paatos':
      return generatePostSeminarMeeting(seminarDate);
    default:
      return [];
  }
}

function renderPhase(phase, seminarDate, guidanceMeetings) {
  const dateRange = getDateRange(seminarDate, phase.startOffsetWeeks, phase.endOffsetWeeks);
  const guidanceLabel = phase.id === 'paatos' ? 'Arviointi' : 'Teams-ohjaus';
  const phaseCard = document.createElement('article');
  phaseCard.className = 'phase';
  phaseCard.dataset.color = phase.color;

  const tasks = getPhaseTasks(phase, seminarDate)
    .map(
      (task) => `
        <li class="task-item">
          <span class="checkbox" aria-hidden="true"></span>
          <span>${task.text}${task.deadline ? `<small class="task-deadline">${task.deadline}</small>` : ''}</span>
        </li>
      `
    )
    .join('');

  const guidanceList = guidanceMeetings.length
    ? guidanceMeetings
        .map((date) => `<li class="meeting-item"><strong>${guidanceLabel}</strong><span>${formatDate(date)}</span></li>`)
        .join('')
    : '<li class="meeting-item muted"><span>Ei erillistä ohjausta</span></li>';

  phaseCard.innerHTML = `
    <div class="phase-header">
      <span class="phase-number">${phase.number}</span>
      <span class="phase-title">${phase.title}<br /><small>${phase.subtitle}</small></span>
    </div>

    <div class="phase-content">
      <div>
        <div class="date-row">Tavoitepäivä</div>
        <div class="date-underline"></div>
        <div class="date-text">${dateRange.label}</div>
      </div>

      <ul class="task-list">${tasks}</ul>

      <div class="guidance-box">
        <div class="guidance-label">Ohjausajat</div>
        <ul class="meeting-list">${guidanceList}</ul>
      </div>

      <div class="goal-box">
        <div>
          <strong>${phase.badge}</strong>
        </div>
      </div>
    </div>
  `;

  return phaseCard;
}

function renderTimeline(selectedId) {
  const selected = seminarDates.find(item => item.id === selectedId) ?? seminarDates[0];
  timelineEl.innerHTML = '';

  phaseDefinitions.forEach((phase) => {
    const guidanceMeetings = getGuidanceMeetingsForPhase(selected.id, phase.id);
    const railGuidanceLabel = phase.id === 'paatos' ? 'Arviointi' : 'Ohjaus';
    const dateRange = getDateRange(selected.id, phase.startOffsetWeeks, phase.endOffsetWeeks);
    const additionalDates = phase.id === 'viimeistely'
      ? `<div class="date-rail-entry"><span class="date-rail-caption">Viestinnän tarkistus</span><strong>${formatDate(getCommunicationReviewDate(selected.id))}</strong></div>`
      : phase.id === 'paatos'
        ? `<div class="date-rail-entry"><span class="date-rail-caption">Ilmoittautuminen</span><strong>${formatDateTime(getRegistrationDeadline(selected.id))}</strong></div>
           <div class="date-rail-entry"><span class="date-rail-caption">Loppuseminaari</span><strong>${formatDate(new Date(`${selected.id}T10:30:00`))}</strong></div>`
        : '';
    const timelineRow = document.createElement('div');
    timelineRow.className = 'timeline-row';
    timelineRow.innerHTML = `
      <div class="date-rail">
        <span class="date-rail-point" aria-hidden="true"></span>
        <div class="date-rail-entry">
          <span class="date-rail-caption">Vaiheen ajankohta</span>
          <strong>${dateRange.label}</strong>
        </div>
        ${additionalDates}
        ${guidanceMeetings.length
          ? `<div class="date-rail-meetings">${guidanceMeetings.map((date) => `<div class="date-rail-entry"><span class="date-rail-caption">${railGuidanceLabel}</span><strong>${formatDate(date)}</strong></div>`).join('')}</div>`
          : ''}
      </div>
    `;
    timelineRow.appendChild(renderPhase(phase, selected.id, guidanceMeetings));
    timelineEl.appendChild(timelineRow);
  });

  const note = document.createElement('div');
  note.className = 'note';
  note.innerHTML = `
    <span><strong>Työ etenee vaiheittain, mutta totetus ja raportointi kulkevat rinnakkain.</strong></span>
    <span>Varaa ohjausajat ajoissa ja pidä omat tavoitteet jokaisessa vaiheessa.</span>
  `;
  timelineEl.appendChild(note);
}

function initializeSeminarSelector() {
  seminarDates.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.label;
    selectEl.appendChild(option);
  });

  const defaultValue = seminarDates[0].id;
  selectEl.value = defaultValue;

  selectEl.addEventListener('change', (event) => {
    renderTimeline(event.target.value);
  });
}

initializeSeminarSelector();
renderTimeline(seminarDates[0].id);

if (printButtonEl) {
  printButtonEl.addEventListener('click', () => {
    window.print();
  });
}
