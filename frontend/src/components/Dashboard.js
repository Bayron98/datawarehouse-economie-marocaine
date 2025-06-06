import { fetchIndicators, fetchTimeSeries } from '../api.js';
import { renderIndicatorCard } from './IndicatorCard.js';
import { renderChartPanel } from './ChartPanel.js';
import { renderDataTable } from './DataTable.js';

export async function renderDashboard(root) {
  root.innerHTML = `
    <header>
      <h1>Tableau de bord - Économie Marocaine</h1>
      <nav>
        <button id="refresh-btn">Rafraîchir</button>
      </nav>
    </header>
    <section id="indicators"></section>
    <section id="charts"></section>
    <section id="datatable"></section>
  `;

  document.getElementById('refresh-btn').onclick = () => location.reload();

  // Affichage des indicateurs clés
  const indicators = await fetchIndicators();
  document.getElementById('indicators').innerHTML = indicators.map(renderIndicatorCard).join('');

  // Affichage des graphiques
  const timeSeries = await fetchTimeSeries();
  renderChartPanel(document.getElementById('charts'), timeSeries);

  // Affichage du tableau de données
  renderDataTable(document.getElementById('datatable'), timeSeries);
}
