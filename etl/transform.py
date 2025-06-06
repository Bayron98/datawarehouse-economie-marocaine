# Nettoyage, transformation et structuration des données pour le modèle en étoile
import os
import pandas as pd
from etl.config import data_dir

# Exemple de fonction de transformation (à adapter selon les fichiers extraits)
def transform_all():
    # Parcourir les fichiers CSV extraits (ignorer les Metadata)
    for file in os.listdir(data_dir):
        if file.startswith('API_') and file.endswith('.csv'):
            df = pd.read_csv(os.path.join(data_dir, file), skiprows=4)
            # On garde les colonnes d'identification + toutes les années
            id_cols = ['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code']
            year_cols = [col for col in df.columns if col.isdigit()]
            df_melt = df.melt(id_vars=id_cols, value_vars=year_cols, var_name='Year', value_name='Value')
            # On ne garde que les lignes pour le Maroc et les valeurs non nulles
            df_melt = df_melt[(df_melt['Country Code'] == 'MAR') & (df_melt['Value'].notnull())]
            out_path = os.path.join(data_dir, 'transformed_' + file)
            df_melt.to_csv(out_path, index=False)
            print(f"{file} transformé et sauvegardé.")

if __name__ == "__main__":
    transform_all()
