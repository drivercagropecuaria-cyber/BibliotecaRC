#!/usr/bin/env python3
"""
Importação em Lote de Dados KML para PostgreSQL+PostGIS
========================================================

Importa dados geoespaciais de arquivos KML para PostgreSQL com PostGIS,
seguindo padrões de qualidade do projeto Mundo Virtual Villa Canabrava.

Dependências:
  pip install geopandas shapely sqlalchemy psycopg2-binary lxml

Autor: Roo | Projeto: Mundo Virtual Villa Canabrava
"""

import os
import json
import logging
import sys
from pathlib import Path
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
import warnings

import geopandas as gpd
import pandas as pd
from shapely.geometry import mapping
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError

# Suprimir avisos desnecessários
warnings.filterwarnings('ignore', category=DeprecationWarning)

# Setup de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Mapeamento de camadas para categorias (conforme documento oficial)
LAYER_MAPPING = {
    'PIVO': {'category': 'Infraestrutura', 'subcategory': 'Irrigação'},
    'POCO': {'category': 'Infraestrutura', 'subcategory': 'Abastecimento'},
    'CERCA': {'category': 'Limite', 'subcategory': 'Divisão'},
    'MATA': {'category': 'Ambiental', 'subcategory': 'Mata Nativa'},
    'APP': {'category': 'Ambiental', 'subcategory': 'Preservação'},
    'RESERVA_LEGAL': {'category': 'Ambiental', 'subcategory': 'Reserva Legal'},
    'CASA_COLONO': {'category': 'Edificação', 'subcategory': 'Residencial'},
    'SEDE': {'category': 'Edificação', 'subcategory': 'Administrativo'},
    'PISTA_VAQUEIJADA': {'category': 'Lazer', 'subcategory': 'Eventos'},
    'CONFINAMENTO': {'category': 'Infraestrutura', 'subcategory': 'Produtiva'},
    'CURRAL': {'category': 'Infraestrutura', 'subcategory': 'Produtiva'},
    'SILO': {'category': 'Infraestrutura', 'subcategory': 'Armazenamento'},
    'FABRICA_RACAO': {'category': 'Infraestrutura', 'subcategory': 'Produtiva'},
    'BREJO': {'category': 'Ambiental', 'subcategory': 'Hídrico'},
    'LAGOA': {'category': 'Ambiental', 'subcategory': 'Hídrico'},
    'CORREGO': {'category': 'Ambiental', 'subcategory': 'Hídrico'},
    'ESTRADA': {'category': 'Transporte', 'subcategory': 'Rodoviário'},
    'FERROVIA': {'category': 'Transporte', 'subcategory': 'Ferroviário'},
    'AERODROMO': {'category': 'Transporte', 'subcategory': 'Aéreo'},
    'TALHAO': {'category': 'Produtiva', 'subcategory': 'Manejo'},
}

@dataclass
class ImportMetrics:
    """Métricas de importação"""
    file_name: str
    features_imported: int
    features_skipped: int
    total_area_ha: float
    errors: list
    status: str

class KMLImporter:
    """Importador de dados KML para PostgreSQL"""
    
    def __init__(self, db_url: str, schema_name: str = 'gis_data'):
        """
        Inicializa importador
        
        Args:
            db_url: String de conexão PostgreSQL (psycopg2://user:pass@host:port/db)
            schema_name: Nome do schema para dados GIS
        """
        self.db_url = db_url
        self.schema_name = schema_name
        self.engine = None
        self.metrics = []
        self._connect()
    
    def _connect(self) -> bool:
        """Conecta ao banco de dados e cria schema se necessário"""
        try:
            self.engine = create_engine(self.db_url, echo=False)
            with self.engine.connect() as conn:
                # Verificar conexão
                result = conn.execute(text("SELECT 1"))
                logger.info("✅ Conexão com PostgreSQL estabelecida")
                
                # Criar schema se não existir
                conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {self.schema_name}"))
                
                # Habilitar extensões PostGIS
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis_topology"))
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS uuid-ossp"))
                
                conn.commit()
                logger.info(f"✅ Schema '{self.schema_name}' e extensões criados")
                
            return True
        except SQLAlchemyError as e:
            logger.error(f"❌ Erro ao conectar: {e}")
            return False
    
    def _create_tables_if_needed(self) -> bool:
        """Cria tabelas necessárias se não existirem"""
        try:
            with self.engine.connect() as conn:
                # Tabela de camadas
                conn.execute(text(f"""
                    CREATE TABLE IF NOT EXISTS {self.schema_name}.layers (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        name VARCHAR(100) NOT NULL UNIQUE,
                        display_name VARCHAR(255),
                        description TEXT,
                        category VARCHAR(100),
                        style_config JSONB,
                        is_visible BOOLEAN DEFAULT true,
                        z_index INTEGER DEFAULT 0,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """))
                
                # Tabela principal de features
                conn.execute(text(f"""
                    CREATE TABLE IF NOT EXISTS {self.schema_name}.features (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        name VARCHAR(255) NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        subcategory VARCHAR(100),
                        layer_name VARCHAR(100) NOT NULL,
                        geometry GEOMETRY(GEOMETRY, 4326),
                        area_ha DECIMAL(10, 4),
                        perimeter_km DECIMAL(10, 4),
                        attributes JSONB,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW(),
                        source_kml VARCHAR(255),
                        CONSTRAINT fk_layer FOREIGN KEY (layer_name)
                            REFERENCES {self.schema_name}.layers(name)
                    )
                """))
                
                # Índices espaciais
                try:
                    conn.execute(text(f"""
                        CREATE INDEX IF NOT EXISTS idx_features_geometry 
                        ON {self.schema_name}.features USING GIST(geometry)
                    """))
                except:
                    pass
                
                try:
                    conn.execute(text(f"""
                        CREATE INDEX IF NOT EXISTS idx_features_category 
                        ON {self.schema_name}.features(category)
                    """))
                except:
                    pass
                
                try:
                    conn.execute(text(f"""
                        CREATE INDEX IF NOT EXISTS idx_features_name 
                        ON {self.schema_name}.features USING gin(name gin_trgm_ops)
                    """))
                except:
                    pass
                
                conn.commit()
                logger.info("✅ Tabelas criadas com sucesso")
                return True
        except SQLAlchemyError as e:
            logger.error(f"❌ Erro ao criar tabelas: {e}")
            return False
    
    def _get_category_info(self, layer_name: str) -> Dict[str, str]:
        """Determina categoria e subcategoria para um layer"""
        layer_upper = layer_name.upper()
        
        for key, value in LAYER_MAPPING.items():
            if key in layer_upper:
                return value
        
        return {'category': 'Outros', 'subcategory': 'Geral'}
    
    def import_kml(self, kml_file: Path) -> ImportMetrics:
        """
        Importa um arquivo KML individual
        
        Returns:
            ImportMetrics com resultado da importação
        """
        metrics = ImportMetrics(
            file_name=kml_file.name,
            features_imported=0,
            features_skipped=0,
            total_area_ha=0,
            errors=[],
            status='PROCESSING'
        )
        
        try:
            logger.info(f"📖 Importando: {kml_file.name}")
            
            # Ler arquivo KML
            try:
                gdf = gpd.read_file(kml_file, driver='KML')
            except Exception as e:
                metrics.errors.append(f"Erro ao ler KML: {e}")
                metrics.status = 'ERROR'
                logger.error(f"  ❌ Erro ao ler KML: {e}")
                return metrics
            
            if gdf.empty:
                metrics.status = 'SKIPPED'
                logger.warning(f"  ⚠️  Arquivo vazio")
                return metrics
            
            # Extrair nome da camada do nome do arquivo
            layer_name = kml_file.stem  # Nome sem extensão
            category_info = self._get_category_info(layer_name)
            
            # Preparar dados
            gdf = gdf.rename(columns={'Name': 'name', 'Description': 'description'})
            gdf['name'] = gdf.get('name', 'Unnamed')
            gdf['layer_name'] = layer_name
            gdf['category'] = category_info['category']
            gdf['subcategory'] = category_info['subcategory']
            gdf['source_kml'] = kml_file.name
            
            # Calcular área e perímetro
            gdf['area_ha'] = 0.0
            gdf['perimeter_km'] = 0.0
            
            for idx, row in gdf.iterrows():
                geom = row.geometry
                if geom.geom_type in ['Polygon', 'MultiPolygon']:
                    gdf.at[idx, 'area_ha'] = geom.area / 10000
                    gdf.at[idx, 'perimeter_km'] = geom.length / 1000
                elif geom.geom_type == 'LineString':
                    gdf.at[idx, 'perimeter_km'] = geom.length / 1000
            
            # Converter atributos para JSONB
            columns_to_exclude = ['geometry', 'layer_name', 'category', 'subcategory',
                                 'area_ha', 'perimeter_km', 'name', 'description', 'source_kml']
            attribute_columns = [col for col in gdf.columns if col not in columns_to_exclude]
            
            def make_attributes(row):
                attrs = {}
                for col in attribute_columns:
                    val = row[col]
                    if pd.notna(val):
                        attrs[col] = str(val)
                return json.dumps(attrs) if attrs else '{}'
            
            gdf['attributes'] = gdf.apply(make_attributes, axis=1)
            
            # Selecionar colunas finais
            final_columns = ['name', 'category', 'subcategory', 'layer_name', 'geometry',
                           'area_ha', 'perimeter_km', 'attributes', 'source_kml']
            gdf = gdf[final_columns]
            
            # Importar para PostgreSQL
            with self.engine.connect() as conn:
                # Registrar ou atualizar layer
                try:
                    conn.execute(text(f"""
                        INSERT INTO {self.schema_name}.layers (name, display_name, category)
                        VALUES (:name, :display, :category)
                        ON CONFLICT (name) DO NOTHING
                    """), {
                        'name': layer_name,
                        'display': layer_name.replace('_', ' '),
                        'category': category_info['category']
                    })
                except:
                    pass
                
                # Importar features
                for idx, row in gdf.iterrows():
                    try:
                        geom_wkt = row.geometry.wkt
                        
                        conn.execute(text(f"""
                            INSERT INTO {self.schema_name}.features 
                            (name, category, subcategory, layer_name, geometry, 
                             area_ha, perimeter_km, attributes, source_kml)
                            VALUES (
                                :name, :category, :subcategory, :layer_name,
                                ST_GeomFromText(:geom, 4326),
                                :area_ha, :perimeter_km, :attributes::jsonb, :source_kml
                            )
                        """), {
                            'name': row['name'],
                            'category': row['category'],
                            'subcategory': row['subcategory'],
                            'layer_name': row['layer_name'],
                            'geom': geom_wkt,
                            'area_ha': float(row['area_ha']),
                            'perimeter_km': float(row['perimeter_km']),
                            'attributes': row['attributes'],
                            'source_kml': row['source_kml']
                        })
                        
                        metrics.features_imported += 1
                        metrics.total_area_ha += float(row['area_ha'])
                    
                    except Exception as e:
                        metrics.features_skipped += 1
                        metrics.errors.append(f"Feature '{row['name']}': {str(e)}")
                
                conn.commit()
            
            metrics.status = 'SUCCESS'
            logger.info(f"  ✅ {metrics.features_imported} features importados ({metrics.total_area_ha:.2f} ha)")
            
        except Exception as e:
            metrics.status = 'ERROR'
            metrics.errors.append(str(e))
            logger.error(f"  ❌ Erro geral: {e}")
        
        return metrics
    
    def import_batch(self, kml_directory: Path) -> Dict:
        """
        Importa todos os KML de um diretório
        
        Returns:
            Dicionário com resumo da importação
        """
        kml_files = list(kml_directory.glob('**/*.kml'))
        
        if not kml_files:
            logger.error(f"❌ Nenhum arquivo KML encontrado em {kml_directory}")
            return {}
        
        logger.info(f"🚀 Iniciando importação em lote de {len(kml_files)} arquivos...")
        logger.info("-" * 80)
        
        # Criar tabelas
        if not self._create_tables_if_needed():
            return {}
        
        summary = {
            'total_files': len(kml_files),
            'successful': 0,
            'skipped': 0,
            'failed': 0,
            'total_features': 0,
            'total_area_ha': 0.0,
            'files': []
        }
        
        for i, kml_file in enumerate(sorted(kml_files), 1):
            metrics = self.import_kml(kml_file)
            self.metrics.append(metrics)
            
            summary['files'].append({
                'name': metrics.file_name,
                'status': metrics.status,
                'features': metrics.features_imported
            })
            
            if metrics.status == 'SUCCESS':
                summary['successful'] += 1
                summary['total_features'] += metrics.features_imported
                summary['total_area_ha'] += metrics.total_area_ha
            elif metrics.status == 'SKIPPED':
                summary['skipped'] += 1
            else:
                summary['failed'] += 1
        
        logger.info("-" * 80)
        logger.info(f"\n📊 RESUMO DA IMPORTAÇÃO:")
        logger.info(f"  ✅ Sucesso:     {summary['successful']:3d}")
        logger.info(f"  ⏭️  Pulados:      {summary['skipped']:3d}")
        logger.info(f"  ❌ Falhas:       {summary['failed']:3d}")
        logger.info(f"  📦 Total:       {summary['total_files']:3d}")
        logger.info(f"  🌍 Features:    {summary['total_features']:,d}")
        logger.info(f"  📏 Área total:  {summary['total_area_ha']:,.2f} ha")
        
        return summary


def main():
    """Ponto de entrada principal"""
    
    # Configuração do banco de dados (ajustar conforme necessário)
    # Para desenvolvimento local:
    DB_URL = "postgresql://postgres:password@localhost:5432/villa_canabrava"
    
    # Diretório de KML
    KML_DIR = Path(__file__).parent.parent / "Downloads" / "Documentaçao Auxiliar  Mundo Virtual Villa" / \
        "00_DOCUMENTACAO_OFICIAL_V2" / "03_INTELIGENCIA_GEOESPACIAL" / "KML_RAW"
    
    if not KML_DIR.exists():
        logger.error(f"❌ Diretório KML não encontrado: {KML_DIR}")
        logger.info("Ajuste o caminho em main() conforme necessário")
        sys.exit(1)
    
    # Executar importação
    importer = KMLImporter(DB_URL)
    summary = importer.import_batch(KML_DIR)
    
    # Salvar resumo em JSON
    output_file = Path(__file__).parent.parent / "reports" / "KML_IMPORT_SUMMARY.json"
    output_file.parent.mkdir(exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    logger.info(f"\n✅ Resumo salvo em: {output_file}")


if __name__ == '__main__':
    main()
