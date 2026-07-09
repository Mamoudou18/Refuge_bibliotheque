-- Active: 1783595465876@@127.0.0.1@5432@refugeBibliotheque_db

CREATE TABLE role (
    id_role SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE membre(
    id_membre SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    numero_tel VARCHAR(20) NOT NULL,
    is_actif BOOLEAN DEFAULT TRUE,
    id_role INT NOT NULL DEFAULT 2,
    date_inscription TIMESTAMP DEFAULT NOW(), --format: YYYY-MM-DD HH:MM:SS
    date_maj TIMESTAMP NULL,
    CONSTRAINT fk_membre_role FOREIGN KEY(id_role) REFERENCES role(id_role) ON DELETE RESTRICT -- empêche la suppréssion d'un rôle s'il est utilisé par un utilisateur'
);

CREATE TABLE token(
    id_token SERIAL PRIMARY KEY,
    id_membre INT NOT NULL,
    api_token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50),
    date_expiration TIMESTAMP NOT NULL,
    utilise BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_token_membre FOREIGN KEY (id_membre) REFERENCES membre(id_membre)
);

CREATE TABLE livre (
    id_livre SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    auteur VARCHAR(100) NOT NULL,
    annee_publication INT,
    categorie VARCHAR(100),
    description TEXT,
    nb_exemplaires INT DEFAULT 1,
    nb_disponibles INT DEFAULT 1,
    url_couverture VARCHAR (255),
    date_ajout TIMESTAMP DEFAULT NOW(),
    date_maj TIMESTAMP NULL
);

CREATE TABLE statut_emprunt(
    id_statut SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE emprunt (
    id_emprunt SERIAL PRIMARY KEY,
    id_membre INT NOT NULL,
    id_livre INT NOT NULL,
    date_emprunt TIMESTAMP DEFAULT now(),
    date_retour_prevue TIMESTAMP NOT NULL,
    date_retour_effective TIMESTAMP NULL,
    id_statut INT NOT NULL DEFAULT 1,
    nb_prolongations INT DEFAULT 0,
    CONSTRAINT fk_emprunt_membre FOREIGN KEY (id_membre) REFERENCES membre(id_membre),
    CONSTRAINT fk_emprunt_livre FOREIGN KEY (id_livre) REFERENCES livre(id_livre),
    CONSTRAINT fk_emprunt_statut FOREIGN KEY (id_statut) REFERENCES statut_emprunt(id_statut)
);


-- Insertion des données de référence ----

-- Insertion des rôles
INSERT INTO role (libelle) VALUES
    ('admin'),
    ('membre');

-- Insertion des statuts d'emprunt
INSERT INTO statut_emprunt (libelle) VALUES
    ('en cours'),
    ('bientot'),
    ('en retard'),
    ('prolonge'),
    ('rendu');