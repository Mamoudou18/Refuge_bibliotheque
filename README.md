# 📚 Refuge — Application de Gestion de Bibliothèque

Application web de gestion d'une bibliothèque scolaire — emprunt de livres en ligne.  
Stack : **Angular + PHP + PostgreSQL + MongoDB** sous **Docker**.

---

## 🛠️ Stack technique

| Couche       | Technologie                     |
|--------------|----------------------------------|
| Frontend     | Angular 20                      |
| Backend      | PHP 8.2 natif (PDO)              |
| Base relationnelle | PostgreSQL 15               |
| Base NoSQL   | MongoDB 7.0                      |
| Serveur web  | Nginx (reverse proxy)            |
| Conteneurisation | Docker / Docker Compose      |
| Déploiement  | Fly.io (production)              |
| Versionning  | Git / GitHub                     |

---

## Structure du projet

```
REFUGE_BIBLIOTHEQUE/
├── backend/
│   ├── frontend/
│   ├── src/
│   ├── vendor/
│   ├── composer.json
│   ├── composer.lock
│   └── Dockerfile
├── frontend/
│   ├── .angular/
│   ├── .vscode/
│   ├── dist/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── .editorconfig
│   ├── .gitignore
│   ├── angular.json
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   └── tsconfig.spec.json
├── livrables/
├── nginx/
│   ├── default.conf          # config Nginx (développement)
│   └── default.fly.conf      # config Nginx (production)
├── .dockerignore
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile.fly             # image de production (build Angular + PHP-FPM)
├── fly.toml                   # configuration de l'application Fly.io
├── hash_password.php          # script utilitaire (génération mdp admin)
├── README.md
└── supervisord.conf            # orchestration des process (php-fpm + nginx)
```

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose v2+
- Angular CLI 20.x
- node 20.x
- (Pour le déploiement) [flyctl](https://fly.io/docs/flyctl/) + compte [Fly.io](https://fly.io)
- (Pour le déploiement) `psql` installé en local
- (Pour le déploiement) Un cluster [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## Installation & Démarrage (environnement local)

```bash
# 1. Cloner le projet
git clone https://github.com/Mamoudou18/Refuge_bibliotheque.git
cd refuge_bibliotheque

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

## Accès aux interfaces (environnement local)

| Interface        | URL                        | Identifiants              |
|------------------|----------------------------|---------------------------|
| Application Angular | http://localhost:81     | -                         |
| pgAdmin          | http://localhost:5050       | user@domain.com / SuperSecret |
| Mongo Express    | http://localhost:8081       | admin / pass              |

---

## Architecture des services (environnement local)

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

## Variables d'environnement (environnement local)

# Base de données postgreSQL
DB_HOST=postgresql
DB_NAME=refugeBibliotheque_db
DB_USER=mamoudou
DB_PASSWORD=xxxxx
PGADMIN_PASSWORD=xxxxxxxxxx
PGADMIN_EMAIL=vitegourmandecf26@gmail.com

# Ports
MYSQL_PORT=5432
PGADMIN_PORT=5050
NGINX_PORT=3000

# Application
APP_ENV=development
APP_DEBUG=true
APP_SECRET=xxxxxxxxxxxx

# Paramètres envoi mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=vitegourmandecf26@gmail.com
MAIL_PASSWORD=xxxxxxxxxxxx
MAIL_FROM_ADDRESS=vitegourmandecf26@gmail.com
MAIL_FROM_NAME="Refuge Bibliothèque"
CONTACT_PHONE="+33XXXXXXXXX"

# MongoDB
MONGO_URI=mongodb://MongoDB:27017
MONGO_DB=refugeBibliotheque_db
MONGO_USER=mamoudou
MONGO_PASSWORD=xxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=dwfjjo6uw
CLOUDINARY_API_KEY=716619678975567
CLOUDINARY_API_SECRET=97twZ4ctnOTLunDRFUev7mqWQ68

# Durée de validité des tokens
TOKEN_CONNEXION_DUREE_HEURES=24
TOKEN_RESET_PASSWORD_DUREE_MINUTES=30

# Durée de rétention des tokens expirés ou utilisés (déconnexion)
TOKEN_JOUR_RETENTION=1

⚠️ Ces variables sont définies dans le fichier `.env` à la racine du projet (non versionné). Un fichier `.env.example` peut être fourni comme modèle.

---

## Healthchecks & Ordre de démarrage

```
postgresql ──healthy──► php-fpm ──► nginx
mongo      ──healthy──►                 ──► Application
```

| Service    | Vérification                                      |
|------------|---------------------------------------------------|
| PostgreSQL | `pg_isready -U mamoudou -d Refuge_db`             |
| MongoDB    | `mongosh --eval "db.adminCommand('ping')"`        |

---

## Commandes utiles

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

## 🚀 Déploiement en production (Fly.io)

### Architecture de production

Contrairement à l'environnement de développement (Docker Compose multi-conteneurs : frontend, backend, Nginx, PostgreSQL, MongoDB séparés), la production repose sur une **image unique "tout-en-un"**, orchestrée par Supervisor, contenant :

- Le build de production Angular (fichiers statiques)
- PHP-FPM (backend)
- Nginx (reverse proxy + serveur de fichiers statiques)

Les bases de données sont externalisées :

| Base de données | Solution en production |
|---|---|
| PostgreSQL | [Fly Postgres](https://fly.io/docs/postgres/) (managé, intégré à Fly.io) |
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/atlas) |

### Étapes de déploiement

**1. Authentification**
```bash
fly auth signup   # ou fly auth login si compte existant
```

**2. Initialisation de l'application** *(déjà fait pour ce projet — fly.toml existe)*
```bash
fly launch
```
> Génère automatiquement `fly.toml` et `.dockerignore`. Indiquer `Dockerfile.fly` comme Dockerfile à utiliser.

**3. Création de la base PostgreSQL managée**
```bash
fly postgres create
fly postgres attach <nom-de-la-base>
```

**4. Import du schéma SQL**

Ouvrir un tunnel vers la base de production :
```bash
fly proxy 5432 -a <nom-app-postgres>
```
Puis, dans un autre terminal, importer le schéma :
```bash
psql postgres://<user>:<password>@localhost:5432/<db> -f backend/refuge.sql
```

**5. Configuration des variables sensibles (secrets)**

Toutes les informations sensibles sont injectées via `fly secrets`, jamais versionnées :
```bash
fly secrets set DB_HOST=... DB_PORT=... DB_NAME=... DB_USER=... DB_PASSWORD=...
fly secrets set MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>"
fly secrets set JWT_SECRET=...
fly secrets set CLOUDINARY_URL=...
```

**6. Déploiement**
```bash
fly deploy
```
> Construit l'image à partir de `Dockerfile.fly`, la pousse sur le registre Fly.io, puis démarre la machine.

**7. Vérification**
```bash
fly status
fly logs
```
L'application est accessible via l'URL fournie par défaut par Fly.io (`https://<nom-app>.fly.dev`).

### Gestion des environnements (dev / prod)

⚠️ **Point de vigilance important** : la séparation stricte entre environnements de développement et de production repose sur les fichiers Angular `environment.ts` / `environment.prod.ts`, contenant les URLs d'API et paramètres propres à chaque contexte.

- **En développement**, le `Dockerfile` du frontend doit builder avec :
  ```dockerfile
  RUN ng build --configuration=development
  ```
- **En production**, le `Dockerfile.fly` doit builder avec :
  ```dockerfile
  RUN ng build --configuration=production
  ```

Ne jamais coder d'URL d'API en dur dans le code TypeScript : toujours passer par `environment.apiUrl`.

### Difficultés rencontrées

| Problème | Cause | Solution |
|---|---|---|
| La prod interrogeait la base de dev | URLs d'API codées en dur dans le code au lieu d'utiliser les fichiers `environment` | Externalisation des URLs dans `environment.ts` / `environment.prod.ts` |
| Erreur de connexion MongoDB Atlas | Mauvais format de l'URI dans le secret `MONGO_URI` | Correction du format de la chaîne de connexion (encodage du mot de passe, nom du cluster) |
| Le dev utilisait la config de prod | Absence de `--configuration=development` dans le `Dockerfile` de développement | Ajout explicite de l'option dans le Dockerfile de dev |

### Mise à jour de l'application

```bash
fly deploy
```

---

## Notes

- Les mots de passe dans ce README sont des exemples — remplacez-les en production
- Le port `27018` est utilisé pour MongoDB pour éviter les conflits avec une instance locale
- Le port `81` est utilisé pour Nginx pour éviter les conflits avec d'autres serveurs locaux
- En production, un seul conteneur héberge frontend + backend (via Supervisor), les bases de données étant hébergées séparément (Fly Postgres + MongoDB Atlas)

---

## 🔗 Liens utiles

- Dépôt GitHub : [Refuge_bibliotheque](https://github.com/Mamoudou18/Refuge_bibliotheque)
- Application en production : `https://refuge-bibliotheque.fly.dev`

---

## ✨ Concept

> *Dans un monde qui s'accélère, certains endroits résistent.*  
> *Refuge, c'est la bibliothèque de votre école — un espace où chaque livre vous attend, prêt à être emprunté en quelques clics.*  
>
> *Explorez. Choisissez. Empruntez.*