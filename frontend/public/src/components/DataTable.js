export function renderDataTable(container, timeSeries) {
  let html = '<table><thead><tr><th>Année</th>';
  timeSeries.series.forEach(serie => {
    html += `<th>${serie.label}</th>`;
  });
  html += '</tr></thead><tbody>';
  timeSeries.years.forEach((year, i) => {
    html += `<tr><td>${year}</td>`;
    timeSeries.series.forEach(serie => {
      let val = serie.values[i];
      html += `<td>${val !== null && val !== undefined && val !== '' ? val : '-'}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}
