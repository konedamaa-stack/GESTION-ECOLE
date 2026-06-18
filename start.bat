@echo off
echo =======================================
echo Lancement et Mise a jour de l'application
echo =======================================

echo 1. Telechargement des dernieres mises a jour...
git pull

echo 2. Installation des dependances (si necessaire)...
call npm install

echo 3. Demarrage du serveur...
npm run dev
