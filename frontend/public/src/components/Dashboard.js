import { fetchIndicators, fetchTimeSeries } from '../api.js';
import { renderIndicatorCard } from './IndicatorCard.js';
import { renderChartPanel } from './ChartPanel.js';
import { renderDataTable } from './DataTable.js';

// Liste des indicateurs exprimés en pourcentage ou taux
const INDICATEURS_TAUX = [
  'Taux de chômage',
  'Inflation (prix à la consommation, % annuel)',
  'Taux de croissance du PIB (% annuel)',
  'Taux d’investissement (% du PIB)'
];

function getDelta(current, previous, label) {
  if (current == null || previous == null) return null;
  if (INDICATEURS_TAUX.includes(label)) {
    // Variation absolue en points de pourcentage
    return Math.round((current - previous) * 10) / 10;
  } else {
    // Variation relative en %
    const delta = ((current - previous) / Math.abs(previous)) * 100;
    return Math.round(delta * 10) / 10;
  }
}

function getDeltaLabel(delta, label) {
  if (delta === null) return '-';
  if (INDICATEURS_TAUX.includes(label)) {
    return (delta > 0 ? 'Hausse' : (delta < 0 ? 'Baisse' : 'Stable')) + ' (' + (delta > 0 ? '+' : '') + delta + ' pts)';
  } else {
    return (delta > 0 ? 'Hausse' : (delta < 0 ? 'Baisse' : 'Stable')) + ' (' + (delta > 0 ? '+' : '') + delta + '%)';
  }
}

function getLastValid(values) {
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== null && values[i] !== undefined && values[i] !== '') return { value: values[i], idx: i };
  }
  return { value: null, idx: -1 };
}

export async function renderDashboard(root) {
  root.innerHTML = `
    <header id="main-header">
      <div class="header-left">
        <img src="./Flag_of_Morocco.svg" alt="Drapeau Maroc" class="logo" style="height:32px;width:auto;margin-right:0.7rem;vertical-align:middle;box-shadow:0 2px 8px #0002;border-radius:3px;" />
        <span class="header-title">Économie Marocaine</span>
      </div>
      <nav class="header-nav">
        <button id="refresh-btn" class="refresh-btn" title="Rafraîchir les données">🔄 Rafraîchir les données</button>
        <button id="scroll-kpi" class="nav-btn">Indicateurs</button>
        <button id="scroll-bi" class="nav-btn">BI</button>
        <button id="scroll-charts" class="nav-btn">Graphiques</button>
        <button id="scroll-table" class="nav-btn">Tableau</button>
      </nav>
      <div id="header-section-indicator"></div>
    </header>
    <section id="dashboard-sources">
      <b>Sources de données :</b> Toutes les données affichées proviennent exclusivement de la Banque Mondiale (World Bank Open Data), extraites automatiquement via API et fichiers CSV. Dernière mise à jour : juin 2025.
    </section>
    <section id="kpi-cards" class="section-block"></section>
    <section id="bi-panels" class="section-block"></section>
    <section id="charts" class="section-block"></section>
    <section id="datatable" class="section-block"></section>
  `;

  // Navigation scroll vers section
  document.getElementById('scroll-kpi').onclick = () => document.getElementById('kpi-cards').scrollIntoView({behavior:'smooth'});
  document.getElementById('scroll-bi').onclick = () => document.getElementById('bi-panels').scrollIntoView({behavior:'smooth'});
  document.getElementById('scroll-charts').onclick = () => document.getElementById('charts').scrollIntoView({behavior:'smooth'});
  document.getElementById('scroll-table').onclick = () => document.getElementById('datatable').scrollIntoView({behavior:'smooth'});
  document.getElementById('refresh-btn').onclick = async () => {
    // Création du popup animé
    let popup = document.createElement('div');
    popup.className = 'refresh-popup';
    popup.innerHTML = `
      <div class="refresh-popup-content">
        <div class="refresh-spinner"></div>
        <div class="refresh-text">Mise à jour des données en cours…</div>
      </div>
    `;
    document.body.appendChild(popup);
    // Appel backend pour relancer le pipeline ETL
    try {
      const res = await fetch('http://localhost:5000/api/refresh_etl', {method:'POST'});
      if (res.ok) {
        popup.querySelector('.refresh-text').innerHTML = 'Données à jour !';
        popup.querySelector('.refresh-spinner').classList.add('success');
        setTimeout(()=>{
          popup.remove();
          location.reload();
        }, 1200);
      } else {
        popup.querySelector('.refresh-text').innerHTML = 'Erreur lors de la mise à jour.';
        popup.querySelector('.refresh-spinner').classList.add('fail');
        setTimeout(()=>popup.remove(), 2000);
      }
    } catch(e) {
      popup.querySelector('.refresh-text').innerHTML = 'Erreur de connexion au serveur.';
      popup.querySelector('.refresh-spinner').classList.add('fail');
      setTimeout(()=>popup.remove(), 2000);
    }
  };

  // Affichage dynamique de la section courante dans la topbar (prend en compte la hauteur réelle de la topbar)
  const sectionIndicator = document.getElementById('header-section-indicator');
  const sectionNames = [
    {id:'kpi-cards', label:'Indicateurs'},
    {id:'bi-panels', label:'BI'},
    {id:'charts', label:'Graphiques'},
    {id:'datatable', label:'Tableau'}
  ];
  function getCurrentSection() {
    // Nouvelle logique : section dont le centre est le plus proche du centre de la fenêtre (viewport)
    const topbar = document.querySelector('header');
    const topbarHeight = topbar ? topbar.offsetHeight : 0;
    const viewportCenter = window.scrollY + topbarHeight + window.innerHeight / 2;
    let minDelta = Infinity;
    let current = sectionNames[0];
    for (const s of sectionNames) {
      const el = document.getElementById(s.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + window.scrollY + rect.height / 2;
        const delta = Math.abs(elCenter - viewportCenter);
        if (delta < minDelta) {
          minDelta = delta;
          current = s;
        }
      }
    }
    return current;
  }
  function updateSectionIndicator() {
    const current = getCurrentSection();
    sectionIndicator.innerHTML = `<span class="section-indicator">${current.label}</span>`;
  }
  window.addEventListener('scroll', updateSectionIndicator);
  updateSectionIndicator();

  // Récupérer toutes les séries temporelles pour enrichir les KPIs
  const timeSeries = await fetchTimeSeries();
  const kpiCards = [];
  timeSeries.series.forEach(serie => {
    const last = getLastValid(serie.values);
    const prev = getLastValid(serie.values.slice(0, last.idx));
    const delta = getDelta(last.value, prev.value, serie.label);
    kpiCards.push({
      label: serie.label,
      value: last.value !== null ? last.value.toLocaleString('fr-FR') : '-',
      year: timeSeries.years[last.idx],
      trend: delta,
      trendLabel: getDeltaLabel(delta, serie.label),
      color: serie.color
    });
  });
  // Affichage des KPI cards enrichies
  document.getElementById('kpi-cards').innerHTML = kpiCards.map(renderIndicatorCard).join('');

  // Panneaux BI additionnels (exemples)
  document.getElementById('bi-panels').innerHTML = `
    <div class="bi-panel">
      <h3>Analyse rapide</h3>
      <ul>
        <li><b>Indicateur le plus dynamique :</b> ${kpiCards.reduce((a, b) => Math.abs(a.trend||0) > Math.abs(b.trend||0) ? a : b).label}</li>
        <li><b>Année la plus récente :</b> ${Math.max(...timeSeries.years)}</li>
        <li><b>PIB actuel :</b> ${kpiCards.find(k=>k.label.includes('PIB (US$ courant)'))?.value || '-'}</li>
        <li><b>Indicateur en plus forte baisse :</b> ${kpiCards.reduce((a, b) => (a.trend||0) < (b.trend||0) ? a : b).label}</li>
      </ul>
    </div>
    <div class="bi-panel">
      <h3>Alertes & Décision</h3>
      <ul>
        ${kpiCards.map(k=>{
          if (INDICATEURS_TAUX.includes(k.label)) {
            return k.trend !== null && Math.abs(k.trend) > 2 ? `<li class='alert-anim'>
              <span class="alert-icon ${k.trend > 0 ? 'up' : 'down'}">${k.trend > 0 ? '⚠️' : '🔻'}</span>
              <span class="alert-text">${k.label} : variation ${k.trend > 0 ? '↑' : '↓'} <b>${Math.abs(k.trend)} pts</b> en ${k.year}</span>
            </li>` : '';
          } else {
            return k.trend !== null && Math.abs(k.trend) > 10 ? `<li class='alert-anim'>
              <span class="alert-icon ${k.trend > 0 ? 'up' : 'down'}">${k.trend > 0 ? '⚠️' : '🔻'}</span>
              <span class="alert-text">${k.label} : variation ${k.trend > 0 ? '↑' : '↓'} <b>${Math.abs(k.trend)}%</b> en ${k.year}</span>
            </li>` : '';
          }
        }).join('')}
      </ul>
    </div>
  `;

  // Affichage des graphiques (séparés)
  renderChartPanel(document.getElementById('charts'), timeSeries);
  // Affichage du tableau de données avec pagination
  renderDataTable(document.getElementById('datatable'), timeSeries, 1, 10);

  // Chercher la date de mise à jour la plus récente dans les fichiers de données (injectée dynamiquement)
  // Valeur obtenue dynamiquement côté serveur ou build : 6 juin 2025 à 21:12
  // Récupération automatisée de la date de dernière modification du fichier de données le plus récent
  let dateMaj = '';
  try {
    const res = await fetch('http://localhost:5000/api/last_update');
    if (res.ok) {
      const data = await res.json();
      dateMaj = data.last_update;
    }
  } catch (e) {
    dateMaj = 'indisponible';
  }
  document.getElementById('dashboard-sources').innerHTML = `<b>Sources de données :</b> Toutes les données affichées proviennent exclusivement de la Banque Mondiale (World Bank Open Data), extraites automatiquement via API et fichiers CSV. Dernière mise à jour : <b>${dateMaj}</b>.`;
}
