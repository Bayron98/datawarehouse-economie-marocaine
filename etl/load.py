# Chargement des données transformées dans MySQL (modèle en étoile)
import os
import pandas as pd
import mysql.connector
from etl.config import data_dir, MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

def get_or_create_date(cursor, annee):
    cursor.execute("SELECT id FROM dim_date WHERE annee=%s AND mois IS NULL AND trimestre IS NULL", (annee,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("INSERT INTO dim_date (annee, mois, trimestre) VALUES (%s, NULL, NULL)", (annee,))
    return cursor.lastrowid

def get_or_create_indicateur(cursor, nom, code):
    cursor.execute("SELECT id, nom FROM dim_indicateur WHERE code=%s", (code,))
    result = cursor.fetchone()
    if result:
        # Mettre à jour le nom si différent
        if result[1] != nom:
            cursor.execute("UPDATE dim_indicateur SET nom=%s WHERE id=%s", (nom, result[0]))
        return result[0]
    cursor.execute("INSERT INTO dim_indicateur (nom, code) VALUES (%s, %s)", (nom, code))
    return cursor.lastrowid

# Dictionnaire de traduction des indicateurs
INDICATEUR_TRAD = {
    'GDP (current US$)': 'PIB (US$ courant)',
    'GDP per capita (current US$)': 'PIB par habitant (US$ courant)',
    'Unemployment, total (% of total labor force) (modeled ILO estimate)': 'Taux de chômage',
    'Inflation, consumer prices (annual %)': 'Inflation (prix à la consommation, % annuel)',
    'GDP growth (annual %)': 'Taux de croissance du PIB (% annuel)',
    'Gross capital formation (% of GDP)': 'Taux d’investissement (% du PIB)',
    # Ajoutez d'autres traductions si besoin
}

def load_to_mysql():
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE
    )
    cursor = conn.cursor()
    # Vider la table de faits avant chaque chargement pour éviter les doublons
    cursor.execute("DELETE FROM fait_indicateurs")
    conn.commit()
    # Exemple : charger chaque fichier transformé dans une table de faits temporaire
    for file in os.listdir(data_dir):
        if file.startswith('transformed_') and file.endswith('.csv'):
            df = pd.read_csv(os.path.join(data_dir, file))
            # TODO: insérer dans les tables de faits/dimensions selon le modèle en étoile
            # Exemple d'insertion (à adapter)
            for _, row in df.iterrows():
                annee = int(row['Year'])
                valeur = row['Value']
                nom = row['Indicator Name']
                code = row['Indicator Code']
                # Traduction du nom si possible
                nom_fr = INDICATEUR_TRAD.get(nom, nom)
                date_id = get_or_create_date(cursor, annee)
                indicateur_id = get_or_create_indicateur(cursor, nom_fr, code)
                cursor.execute("""
                    INSERT INTO fait_indicateurs (date_id, indicateur_id, valeur)
                    VALUES (%s, %s, %s)
                """, (date_id, indicateur_id, valeur))
            conn.commit()
            print(f"{file} chargé dans MySQL.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    load_to_mysql()
