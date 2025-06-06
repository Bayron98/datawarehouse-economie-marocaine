# Paramètres de configuration pour l'ETL
# Exemple : informations de connexion MySQL, chemins, URLs d'API, etc.

MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = ''  # À adapter selon votre config XAMPP
MYSQL_DATABASE = 'economie_marocaine_dw'

# Dossiers de stockage temporaire
data_dir = 'data/'

# URLs d'exemple pour extraction (Banque Mondiale, HCP, etc.)
WORLD_BANK_API = 'http://api.worldbank.org/v2/country/MA/indicator/{indicator}?downloadformat=csv&date=2000:2024'
HCP_DATA_URL = 'https://www.hcp.ma/downloads/Indicateurs-statistiques_t130.html'  # À adapter selon les besoins
