import { fetchIndicators, fetchTimeSeries } from '../api.js';
import { renderIndicatorCard } from './IndicatorCard.js';
import { renderChartPanel } from './ChartPanel.js';
import { renderDataTable } from './DataTable.js';

function getDelta(current, previous) {
  if (current == null || previous == null) return null;
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  return Math.round(delta * 10) / 10;
}

function getLastValid(values) {
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== null && values[i] !== undefined && values[i] !== '') return { value: values[i], idx: i };
  }
  return { value: null, idx: -1 };
}

export async function renderDashboard(root) {
  root.innerHTML = `
    <header>
      <h1>Tableau de bord - Économie Marocaine</h1>
      <nav>
        <button id="refresh-btn">Rafraîchir</button>
      </nav>
    </header>
    <section id="kpi-cards"></section>
    <section id="bi-panels"></section>
    <section id="charts"></section>
    <section id="datatable"></section>
  `;

  document.getElementById('refresh-btn').onclick = () => location.reload();

  // Récupérer toutes les séries temporelles pour enrichir les KPIs
  const timeSeries = await fetchTimeSeries();
  const kpiCards = [];
  timeSeries.series.forEach(serie => {
    const last = getLastValid(serie.values);
    const prev = getLastValid(serie.values.slice(0, last.idx));
    const delta = getDelta(last.value, prev.value);
    kpiCards.push({
      label: serie.label,
      value: last.value !== null ? last.value.toLocaleString('fr-FR') : '-',
      year: timeSeries.years[last.idx],
      trend: delta,
      trendLabel: delta === null ? '-' : (delta > 0 ? 'Hausse' : (delta < 0 ? 'Baisse' : 'Stable')),
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
        ${kpiCards.map(k=>k.trend !== null && Math.abs(k.trend) > 10 ? `<li class='alert'>${k.label} : variation ${k.trend > 0 ? '↑' : '↓'} ${Math.abs(k.trend)}% en ${k.year}</li>` : '').join('')}
      </ul>
    </div>
  `;

  // Affichage des graphiques
  renderChartPanel(document.getElementById('charts'), timeSeries);
  // Affichage du tableau de données
  renderDataTable(document.getElementById('datatable'), timeSeries);
}
