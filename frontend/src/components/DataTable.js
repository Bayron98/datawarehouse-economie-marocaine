export function renderDataTable(container, timeSeries) {
  let html = '<table><thead><tr><th>Année</th>';
  timeSeries.series.forEach(serie => {
    html += `<th>${serie.label}</th>`;
  });
  html += '</tr></thead><tbody>';
  timeSeries.years.forEach((year, i) => {
    html += `<tr><td>${year}</td>`;
    timeSeries.series.forEach(serie => {
      html += `<td>${serie.values[i]}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}
