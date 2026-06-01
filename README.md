# 📚 Refuge — Application de Gestion de Bibliothèque

Application web de gestion d'une bibliothèque scolaire — emprunt de livres en ligne.  
Stack : **Angular + PHP + PostgreSQL + MongoDB** sous **Docker**.

---

##  Structure du projet

```
refuge-app/
├── backend/
│   ├── Dockerfile
│   └── index.php
├── frontend/
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── default.conf
├── docker-compose.yml
└── README.md
```

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose v2+
- Angular CLI 20.x
- node 20.x

---

##  Installation & Démarrage

```bash
# 1. Cloner le projet
git clone https://github.com/Mamoudou18/Refuge-biblioApp.git
cd refuge-biblioApp

# 2. Installation & Création projet Angular
node -v
npm -v
npm install -g @‌angular/cli@20
ng version # pour vérifier la version angular
ng new frontend

# 3. Lancer l'application en local pour tester
cd frontend
ng serve

# 4. Lancer tous les services
docker compose up -d

# 5. Vérifier que tout tourne
docker compose ps
```

---

##  Accès aux interfaces

| Interface        | URL                        | Identifiants              |
|------------------|----------------------------|---------------------------|
| Application Angular | http://localhost:81     | -                         |
| pgAdmin          | http://localhost:5050       | user@domain.com / SuperSecret |
| Mongo Express    | http://localhost:8081       | admin / pass              |

---

##  Architecture des services

| Service        | Image                  | Port exposé | Rôle                          |
|----------------|------------------------|-------------|-------------------------------|
| `postgresql`   | postgres:15-alpine     | 5432        | Base de données relationnelle |
| `pgadmin`      | dpage/pgadmin4         | 5050        | Interface admin PostgreSQL    |
| `mongo`        | mongo:7.0              | 27018       | Base de données NoSQL         |
| `mongo-express`| mongo-express          | 8081        | Interface admin MongoDB       |
| `php-fpm`      | php:8.2-fpm-alpine     | -           | Backend PHP                   |
| `frontend`     | node:20-alpine + nginx | -           | Angular (multi-stage build)   |
| `nginx`        | nginx:alpine           | 81          | Reverse proxy                 |

---

##  Bases de données

### PostgreSQL — Données relationnelles
Gère les livres, les utilisateurs, les emprunts, les réservations et les catégories.

| Table           | Description                                |
|-----------------|--------------------------------------------|
| `utilisateurs`  | Comptes élèves et administrateurs          |
| `livres`        | Catalogue complet de la bibliothèque       |
| `exemplaires`   | Exemplaires physiques de chaque livre      |
| `emprunts`      | Historique et emprunts en cours            |
| `reservations`  | File d'attente pour les livres indisponibles |
| `categories`    | Genres et thématiques des livres           |

### MongoDB — Données non relationnelles
Gère les avis, les logs et les statistiques de consultation.

| Collection         | Description                              |
|--------------------|------------------------------------------|
| `avis`             | Commentaires et notes des lecteurs       |
| `logs_activite`    | Journal des actions utilisateurs         |
| `stats_consultation` | Popularité et tendances des livres     |

---

##  Variables d'environnement

### PostgreSQL
| Variable            | Valeur       |
|---------------------|--------------|
| POSTGRES_USER       | mamoudou     |
| POSTGRES_PASSWORD   | xxxxxxxx     |
| POSTGRES_DB         | Refuge_db    |

### MongoDB
| Variable                         | Valeur   |
|----------------------------------|----------|
| MONGO_INITDB_ROOT_USERNAME       | mamoudou |
| MONGO_INITDB_ROOT_PASSWORD       | xxxxxxxx |
| MONGO_INITDB_DATABASE            | refuge   |

---

##  Healthchecks & Ordre de démarrage

```
postgresql ──healthy──► php-fpm ──► nginx
mongo      ──healthy──►                 ──► Application
```

| Service    | Vérification                                      |
|------------|---------------------------------------------------|
| PostgreSQL | `pg_isready -U mamoudou -d Refuge_db`             |
| MongoDB    | `mongosh --eval "db.adminCommand('ping')"`        |

---

##  Commandes utiles

```bash
# Voir l'état des containers
docker compose ps

# Voir tous les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f php-fpm
docker compose logs -f postgresql
docker compose logs -f nginx

# Arrêter les services
docker compose down

# Arrêter ET supprimer les volumes ( perte de données)
docker compose down -v

# Rebuilder les images sans cache
docker compose build --no-cache

# Redémarrer un service
docker compose restart php-fpm

# Entrer dans un container
docker exec -it refuge_postgresql bash
docker exec -it refuge_php_fpm sh
docker exec -it refuge_mongo bash
```

---

## Dépannage

### Un container ne démarre pas
```bash
docker compose logs <nom-du-service>
```

### Réinitialiser complètement
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Vérifier la connexion PostgreSQL
```bash
docker exec -it refuge_postgresql psql -U mamoudou -d Refuge_db
```

### Vérifier la connexion MongoDB
```bash
docker exec -it refuge_mongo mongosh -u mamoudou -p xxxxxxxx
```

---

##  Notes

- Les mots de passe dans ce README sont des exemples — remplacez-les en production
- Le port `27018` est utilisé pour MongoDB pour éviter les conflits avec une instance locale
- Le port `81` est utilisé pour Nginx pour éviter les conflits avec d'autres serveurs locaux

---

## ✨ Concept

> *Dans un monde qui s'accélère, certains endroits résistent.*  
> *Refuge, c'est la bibliothèque de votre école — un espace où chaque livre vous attend, prêt à être emprunté en quelques clics.*  
>
> *Explorez. Choisissez. Empruntez.*
