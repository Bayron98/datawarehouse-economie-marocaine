export function renderChartPanel(container, timeSeries) {
  // Un graphique par indicateur, chaque graphique dans une carte séparée
  container.innerHTML = timeSeries.series.map((serie, idx) => `
    <div class="chart-group">
      <h2>${serie.label}</h2>
      <canvas id="chart${idx}"></canvas>
    </div>
  `).join('');

  timeSeries.series.forEach((serie, idx) => {
    const ctx = document.getElementById(`chart${idx}`).getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeSeries.years,
        datasets: [{
          label: serie.label,
          data: serie.values,
          borderColor: serie.color,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        }
      }
    });
  });
}
