@echo off

REM Backend folders
mkdir backend
mkdir backend\config
mkdir backend\controllers
mkdir backend\models
mkdir backend\routes
mkdir backend\middleware
mkdir backend\services
mkdir backend\validations
mkdir backend\utils

REM Frontend folders
mkdir frontend
mkdir frontend\public
mkdir frontend\src
mkdir frontend\src\assets
mkdir frontend\src\components
mkdir frontend\src\components\admin
mkdir frontend\src\components\lecturer
mkdir frontend\src\components\student
mkdir frontend\src\components\common
mkdir frontend\src\pages
mkdir frontend\src\services
mkdir frontend\src\context
mkdir frontend\src\hooks
mkdir frontend\src\utils
mkdir frontend\src\styles

echo Folder structure for Quizora MERN Quiz System created successfully in current directory!
pause
