# Extraction des données depuis les sources (API, CSV, etc.)
import os
import requests
import zipfile
from etl.config import data_dir, WORLD_BANK_API

# Liste d'indicateurs Banque Mondiale (codes)
INDICATORS = {
    'PIB': 'NY.GDP.MKTP.CD',
    'PIB_par_habitant': 'NY.GDP.PCAP.CD',
    'Taux_chomage': 'SL.UEM.TOTL.ZS',
    'Inflation': 'FP.CPI.TOTL.ZG',
    'Taux_croissance': 'NY.GDP.MKTP.KD.ZG',
    'Taux_investissement': 'NE.GDI.TOTL.ZS',
    # Ajouter d'autres indicateurs pertinents ici
}

def download_world_bank_data():
    os.makedirs(data_dir, exist_ok=True)
    for name, code in INDICATORS.items():
        url = WORLD_BANK_API.format(indicator=code)
        response = requests.get(url)
        zip_path = os.path.join(data_dir, f'{name}.zip')
        with open(zip_path, 'wb') as f:
            f.write(response.content)
        # Dézipper le fichier
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(data_dir)
            print(f"{name} téléchargé et extrait.")
        except zipfile.BadZipFile:
            print(f"Erreur lors de la décompression de {zip_path}. Le fichier n'est pas un zip valide.")
        os.remove(zip_path)
    # Afficher la liste des fichiers extraits
    print("Fichiers présents dans data/ :", os.listdir(data_dir))

if __name__ == "__main__":
    download_world_bank_data()
