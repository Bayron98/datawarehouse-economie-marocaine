export function renderChartPanel(container, timeSeries) {
  container.innerHTML = `
    <canvas id="mainChart"></canvas>
  `;
  const ctx = document.getElementById('mainChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeSeries.years,
      datasets: timeSeries.series.map(serie => ({
        label: serie.label,
        data: serie.values,
        borderColor: serie.color,
        fill: false
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Évolution des indicateurs économiques' }
      }
    }
  });
}
