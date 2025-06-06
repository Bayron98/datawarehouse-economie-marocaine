# Point d'entrée unique pour exécuter tout le pipeline ETL
import etl.extract
import etl.transform
import etl.load

if __name__ == "__main__":
    print("--- Extraction des données ---")
    etl.extract.download_world_bank_data()
    print("--- Transformation des données ---")
    etl.transform.transform_all()
    print("--- Chargement dans MySQL ---")
    etl.load.load_to_mysql()
    print("Pipeline ETL terminé.")
