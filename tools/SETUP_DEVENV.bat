@echo off
REM Setup Ambiente Desenvolvimento - Mundo Virtual Villa Canabrava
REM Para: Windows (PowerShell/CMD)
REM Objetivo: Preparar ambiente Python para Fase 0

echo.
echo 🚀 Setup Ambiente Python
echo ====================================

REM 1. Criar virtual environment
echo.
echo 📦 Criando ambiente virtual Python...
python -m venv .venv
if errorlevel 1 (
    echo ❌ Erro ao criar ambiente virtual
    exit /b 1
)

REM Ativar venv (CMD)
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erro ao ativar ambiente virtual
    exit /b 1
)

echo ✅ Ambiente virtual criado e ativado

REM 2. Atualizar pip
echo.
echo 📦 Atualizando pip...
python -m pip install --upgrade pip setuptools wheel > nul 2>&1

REM 3. Instalar dependências
echo.
echo 📦 Instalando dependências GIS...
pip install -r requirements-gis.txt
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    exit /b 1
)

echo ✅ Dependências instaladas

REM 4. Verificar instalações críticas
echo.
echo ✅ Verificações:
python -c "import geopandas; print(f'  ✓ GeoPandas {geopandas.__version__}')"
python -c "import sqlalchemy; print(f'  ✓ SQLAlchemy {sqlalchemy.__version__}')"
python -c "import shapely; print(f'  ✓ Shapely {shapely.__version__}')"

REM 5. Criar diretório de reports
echo.
echo 📂 Criando diretório de relatórios...
if not exist "reports" mkdir reports
echo ✅ Diretório criado

REM 6. Resumo
echo.
echo ================================
echo ✅ Setup Completo!
echo ================================
echo.
echo Próximos passos:
echo 1. Executar validação GIS:
echo    python tools/validate_gis_data.py
echo.
echo 2. Revisar relatório:
echo    type reports\GIS_VALIDATION_REPORT.json
echo.
echo 3. Ver mais instruções:
echo    more docs\RUNBOOK_FASE_0_EXECUCAO.md
echo.
echo Ambiente pronto para desenvolvimento! 🎉
echo.

pause
