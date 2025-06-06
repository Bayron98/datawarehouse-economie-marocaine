export function renderDataTable(container, timeSeries, page = 1, pageSize = 10) {
  const totalRows = timeSeries.years.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);

  let html = '<table><thead><tr><th>Année</th>';
  timeSeries.series.forEach(serie => {
    html += `<th>${serie.label}</th>`;
  });
  html += '</tr></thead><tbody>';
  for (let i = startIdx; i < endIdx; i++) {
    html += `<tr><td>${timeSeries.years[i]}</td>`;
    timeSeries.series.forEach(serie => {
      let val = serie.values[i];
      html += `<td>${val !== null && val !== undefined && val !== '' ? val : '-'}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table>';

  // Pagination controls
  html += `<div class="pagination-bar">`;
  html += `<button class="pagination-btn" ${page === 1 ? 'disabled' : ''} data-page="${page - 1}">⟨</button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="pagination-btn${p === page ? ' active' : ''}" data-page="${p}">${p}</button>`;
  }
  html += `<button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}">⟩</button>`;
  html += `</div>`;

  container.innerHTML = html;

  // Event listeners for pagination
  container.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.onclick = (e) => {
      const newPage = parseInt(btn.getAttribute('data-page'));
      if (!isNaN(newPage) && newPage !== page) {
        renderDataTable(container, timeSeries, newPage, pageSize);
      }
    };
  });
}

// Export utilitaire pour pagination dynamique (optionnel)
export function getTotalPages(timeSeries, pageSize = 10) {
  return Math.ceil(timeSeries.years.length / pageSize);
}
