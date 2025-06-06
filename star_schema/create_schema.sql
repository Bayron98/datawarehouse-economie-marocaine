# Script SQL pour créer le modèle en étoile dans MySQL
# À exécuter une seule fois pour initialiser la base

CREATE DATABASE IF NOT EXISTS economie_marocaine_dw;
USE economie_marocaine_dw;

-- Table dimension date
CREATE TABLE IF NOT EXISTS dim_date (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annee INT,
    mois INT,
    trimestre INT
);

-- Table dimension indicateur
CREATE TABLE IF NOT EXISTS dim_indicateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    code VARCHAR(50)
);

-- Table de faits
CREATE TABLE IF NOT EXISTS fait_indicateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_id INT,
    indicateur_id INT,
    valeur FLOAT,
    FOREIGN KEY (date_id) REFERENCES dim_date(id),
    FOREIGN KEY (indicateur_id) REFERENCES dim_indicateur(id)
);

-- Ajouter d'autres dimensions selon les besoins (region, secteur, etc.)
