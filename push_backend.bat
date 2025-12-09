@echo off
echo Initializing git...
git init

echo Removing cached files (if any)...
git rm -r --cached node_modules 2>nul
git rm -r --cached .env 2>nul
git rm -r --cached .env.local 2>nul
git rm -r --cached .env.development.local 2>nul
git rm -r --cached .env.test.local 2>nul
git rm -r --cached .env.production.local 2>nul

echo Adding files...
git add .

echo Committing...
git commit -m "Prepare backend for deployment: exclude dependencies and env files"

echo Setup remote...
git remote remove origin 2>nul
git remote add origin https://github.com/akashmhadgut/captcha-backend.git

echo Pushing...
git branch -M main
git push -u origin main
