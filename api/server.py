from flask import Flask, jsonify, Response, request
import mysql.connector
import os
from datetime import datetime
import subprocess
import threading

app = Flask(__name__)

# Ajout CORS
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response

def get_connection():
    return mysql.connector.connect(
        host='localhost', user='root', password='', database='economie_marocaine_dw'
    )

@app.route('/api/indicators')
def indicators():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""SELECT d.nom as label, f.valeur as value, d.code
                      FROM fait_indicateurs f
                      JOIN dim_indicateur d ON f.indicateur_id = d.id
                      JOIN dim_date dt ON f.date_id = dt.id
                      WHERE dt.annee = (SELECT MAX(annee) FROM dim_date)
                   """)
    data = cursor.fetchall()
    conn.close()
    # Ajoutez ici le calcul de la tendance si besoin
    for ind in data:
        ind['trend'] = 0  # À calculer
    return jsonify(data)

@app.route('/api/timeseries')
def timeseries():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT annee FROM dim_date ORDER BY annee")
    years = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT id, nom, code FROM dim_indicateur")
    indicateurs = cursor.fetchall()
    series = []
    for indic_id, nom, code in indicateurs:
        # Récupère toutes les valeurs disponibles pour cet indicateur
        cursor.execute("""SELECT dt.annee, f.valeur
                            FROM fait_indicateurs f
                            JOIN dim_date dt ON f.date_id = dt.id
                            WHERE f.indicateur_id = %s
                        """, (indic_id,))
        rows = cursor.fetchall()
        # Construire un mapping année -> valeur pour pouvoir aligner sur la liste `years`
        mapping = {row[0]: row[1] for row in rows}
        # Pour chaque année de la liste `years`, récupérer la valeur correspondante ou None
        values = [mapping.get(y, None) for y in years]
        # Définit une couleur safe à partir du code si possible
        color = '#'+(code[-6:] if code and len(code) >= 6 else '000000')
        series.append({'label': nom, 'values': values, 'color': color})
    conn.close()
    return jsonify({'years': years, 'series': series})

@app.route('/api/last_update')
def last_update():
    data_dir = os.path.join(os.path.dirname(__file__), '../data')
    latest_time = None
    latest_file = None
    for fname in os.listdir(data_dir):
        if fname.endswith('.csv') and fname.startswith('transformed_'):
            fpath = os.path.join(data_dir, fname)
            mtime = os.path.getmtime(fpath)
            if latest_time is None or mtime > latest_time:
                latest_time = mtime
                latest_file = fname
    if latest_time:
        dt = datetime.fromtimestamp(latest_time)
        # Format français : 6 juin 2025 à 21:12
        mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
        date_str = f"{dt.day} {mois[dt.month-1]} {dt.year} à {dt.hour:02d}:{dt.minute:02d}"
    else:
        date_str = 'indisponible'
    return jsonify({'last_update': date_str})

@app.route('/api/refresh_etl', methods=['POST'])
def refresh_etl():
    # Lancement du pipeline ETL (main.py) dans un thread pour ne pas bloquer Flask
    def run_etl():
        subprocess.run(['python', 'main.py'])
    thread = threading.Thread(target=run_etl)
    thread.start()
    thread.join()  # On attend la fin pour garantir la fraîcheur
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
