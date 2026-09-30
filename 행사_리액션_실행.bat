@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo 필요한 파일을 처음 한 번 설치합니다...
  npm install
)
echo.
echo 리액션 서버를 시작합니다.
echo 관리자 화면: http://localhost:3000/admin
echo.
start "" "http://localhost:3000/admin"
npm start
pause
