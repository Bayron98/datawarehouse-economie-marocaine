export function renderIndicatorCard(indicator) {
  return `
    <div class="indicator-card" style="border-top: 5px solid ${indicator.color || '#1976d2'};">
      <h2>${indicator.label}</h2>
      <p class="value">${indicator.value}</p>
      <div class="kpi-details">
        <span class="trend ${indicator.trend > 0 ? 'up' : indicator.trend < 0 ? 'down' : 'stable'}">
          ${indicator.trend === null ? '-' : (indicator.trend > 0 ? '▲' : indicator.trend < 0 ? '▼' : '●')} ${indicator.trend !== null ? Math.abs(indicator.trend) + '%' : ''}
        </span>
        <span class="trend-label">${indicator.trendLabel || ''}</span>
        <span class="kpi-year">${indicator.year ? 'Année : ' + indicator.year : ''}</span>
      </div>
    </div>
  `;
}
