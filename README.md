# Nom du réseau
## GlobalLink

Mini-réseau social pour amis (style Facebook 2004 mais en local)
Chat en temps réel entre plusieurs personnes
Réseau social ultra-minimaliste sans pub ni tracking


## ✨ Ce que ça fait (en 3-4 lignes max)

- Inscription / connexion avec pseudo + mot de passe (ou juste pseudo pour commencer)
- Publication de messages / posts visibles par tout le monde
- Chat en temps réel (websockets)
- Système d'amis / follow (optionnel selon ton ambition)
- 100% self-hosted, sans compte Google/Facebook

## Technologies utilisées

- Backend : python/Django
- Frontend : tailwind
- Base de données :PostgreSQL / MySQL
- Temps réel : Socket.IO   (ou WebSockets natifs)
- Déploiement possible : Docker / Railway / Render / VPS classique

## ✨ Fonctionnalités prévues (roadmap rapide)

- [x] Inscription / connexion
- [x] Poster un message
- [ ] Chat privé 1:1
- [ ] Notifications en temps réel
- [ ] Likes / commentaires
- [ ] Mode sombre
- [ ] Version mobile correcte

## 🚀 Comment tester rapidement (le plus important !)

### Prérequis

- Python 3.11
- npm / yarn / pnpm

### En local (30 secondes)

```bash
git clone git@github.com:DjodeGit/GlobalLink.git
cd GlobalLink

# Backend
cd backend
npm install
python3 manage.py runserver

# Frontend (dans un autre terminal)
cd ../frontend
npm install
npm run dev