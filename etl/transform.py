# Nettoyage, transformation et structuration des données pour le modèle en étoile
import os
import pandas as pd
from etl.config import data_dir

# Exemple de fonction de transformation (à adapter selon les fichiers extraits)
def transform_all():
    for file in os.listdir(data_dir):
        if file.startswith('API_') and file.endswith('.csv'):
            # Lire le fichier sans skiprows, détecter la ligne d'en-tête
            with open(os.path.join(data_dir, file), encoding='utf-8') as f:
                lines = f.readlines()
            # Chercher la ligne d'en-tête (celle qui commence par Country Name)
            header_idx = next(i for i, l in enumerate(lines) if l.strip().startswith('"Country Name"') or l.strip().startswith('Country Name'))
            df = pd.read_csv(os.path.join(data_dir, file), skiprows=header_idx)
            # Nettoyage des colonnes
            id_cols = ['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code']
            year_cols = [col for col in df.columns if col.isdigit()]
            df_melt = df.melt(id_vars=id_cols, value_vars=year_cols, var_name='Year', value_name='Value')
            # Nettoyage des valeurs (certaines peuvent être vides ou non numériques)
            df_melt = df_melt[(df_melt['Country Code'] == 'MAR') & (df_melt['Value'].notnull())]
            df_melt['Value'] = pd.to_numeric(df_melt['Value'], errors='coerce')
            df_melt = df_melt[df_melt['Value'].notnull()]
            out_path = os.path.join(data_dir, 'transformed_' + file)
            df_melt.to_csv(out_path, index=False)
            print(f"{file} transformé et sauvegardé.")

if __name__ == "__main__":
    transform_all()
