#!/bin/bash

# Setup Ambiente Desenvolvimento - Mundo Virtual Villa Canabrava
# Para: Linux/macOS
# Objetivo: Preparar ambiente Python para Fase 0

set -e  # Exit on error

echo "🚀 Setup Ambiente Python + Docker"
echo "===================================="

# 1. Criar virtual environment
echo ""
echo "📦 Criando ambiente virtual Python..."
python3 -m venv .venv
source .venv/bin/activate

echo "✅ Ambiente virtual criado e ativado"

# 2. Atualizar pip
echo ""
echo "📦 Atualizando pip..."
pip install --upgrade pip setuptools wheel > /dev/null 2>&1

# 3. Instalar dependências
echo ""
echo "📦 Instalando dependências GIS..."
pip install -r requirements-gis.txt

echo "✅ Dependências instaladas"

# 4. Verificar instalações críticas
echo ""
echo "✅ Verificações:"
python -c "import geopandas; print(f'  ✓ GeoPandas {geopandas.__version__}')"
python -c "import sqlalchemy; print(f'  ✓ SQLAlchemy {sqlalchemy.__version__}')"
python -c "import shapely; print(f'  ✓ Shapely {shapely.__version__}')"

# 5. Criar diretório de reports
echo ""
echo "📂 Criando diretório de relatórios..."
mkdir -p reports
echo "✅ Diretório criado"

# 6. Resumo
echo ""
echo "================================"
echo "✅ Setup Completo!"
echo "================================"
echo ""
echo "Próximos passos:"
echo "1. Executar validação GIS:"
echo "   python tools/validate_gis_data.py"
echo ""
echo "2. Revisar relatório:"
echo "   cat reports/GIS_VALIDATION_REPORT.json"
echo ""
echo "3. Ver mais instruções:"
echo "   less docs/RUNBOOK_FASE_0_EXECUCAO.md"
echo ""
echo "Ambiente pronto para desenvolvimento! 🎉"
