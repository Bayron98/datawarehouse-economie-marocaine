// Exemple d'appel à une API Python exposant les données MySQL
export async function fetchIndicators() {
  const res = await fetch('http://localhost:5000/api/indicators');
  return res.json();
}

export async function fetchTimeSeries() {
  const res = await fetch('http://localhost:5000/api/timeseries');
  return res.json();
}
