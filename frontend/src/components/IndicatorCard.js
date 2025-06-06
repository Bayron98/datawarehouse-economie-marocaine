export function renderIndicatorCard(indicator) {
  return `
    <div class="indicator-card">
      <h2>${indicator.label}</h2>
      <p class="value">${indicator.value}</p>
      <span class="trend ${indicator.trend > 0 ? 'up' : 'down'}">
        ${indicator.trend > 0 ? '▲' : '▼'} ${Math.abs(indicator.trend)}%
      </span>
    </div>
  `;
}
