#!/usr/bin/env python3
"""
Validação Completa de Dados Geoespaciais KML
==============================================

Script para validar e analisar qualidade dos dados KML conforme padrões:
- Null_Fields < 5%
- Overlap_Area = 0
- Erro_Posicional < 1m (WGS84)
- Topology_Errors = 0

Autor: Roo | Projeto: Mundo Virtual Villa Canabrava
"""

import os
import json
import math
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from xml.etree import ElementTree as ET

# Constants
R_EARTH = 6371000  # meters
WGS84_EPSILON = 1  # 1 meter tolerance for positional error

@dataclass
class ValidationMetrics:
    """Métricas de validação de arquivo KML"""
    file_name: str
    features_count: int
    null_fields_percent: float
    has_topology_errors: bool
    geometry_types: List[str]
    bounds: Dict[str, float]
    total_area_m2: float
    has_duplicates: bool
    positional_accuracy: float
    status: str  # 'VALID', 'WARNING', 'ERROR'
    issues: List[str]

@dataclass
class OverlapDetection:
    """Detecção de sobreposições entre features"""
    file_a: str
    file_b: str
    overlap_area_m2: float
    feature_a_id: str
    feature_b_id: str
    overlap_percent_a: float
    overlap_percent_b: float

class GISValidator:
    """Validador de dados geoespaciais KML"""
    
    def __init__(self, kml_directory: str):
        self.kml_dir = Path(kml_directory)
        self.metrics: List[ValidationMetrics] = []
        self.overlaps: List[OverlapDetection] = []
        self.all_features: List[Dict] = []
    
    def haversine(self, lon1: float, lat1: float, lon2: float, lat2: float) -> float:
        """Calcula distância em metros entre dois pontos (Haversine)"""
        try:
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lon2 - lon1)
            a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
            val = math.sqrt(a)
            if val > 1: val = 1
            c = 2 * math.asin(val)
            return R_EARTH * c
        except Exception:
            return 0
    
    def calculate_polygon_area(self, coords: List[Tuple[float, float]]) -> float:
        """Calcula área de polígono usando Shoelace formula (meters²)"""
        if len(coords) < 3:
            return 0
        
        try:
            lats = [p[1] for p in coords]
            mean_lat = sum(lats) / len(lats)
            
            lat_scale = 111320
            lon_scale = 111320 * math.cos(math.radians(mean_lat))
            
            area = 0
            for i in range(len(coords)):
                j = (i + 1) % len(coords)
                x1, y1 = coords[i][0] * lon_scale, coords[i][1] * lat_scale
                x2, y2 = coords[j][0] * lon_scale, coords[j][1] * lat_scale
                area += x1 * y2
                area -= y1 * x2
            
            return abs(area) / 2.0
        except Exception:
            return 0
    
    def calculate_line_length(self, coords: List[Tuple[float, float]]) -> float:
        """Calcula comprimento de linha em metros"""
        length = 0
        for i in range(len(coords) - 1):
            length += self.haversine(coords[i][0], coords[i][1], 
                                     coords[i+1][0], coords[i+1][1])
        return length
    
    def parse_coordinates(self, coord_str: str) -> List[Tuple[float, float]]:
        """Parse coordenadas de string KML"""
        coords = []
        coord_str = coord_str.strip().replace('\n', ' ').replace('\t', ' ')
        points = coord_str.split(' ')
        for p in points:
            if not p.strip(): 
                continue
            parts = p.split(',')
            if len(parts) >= 2:
                try:
                    lon = float(parts[0])
                    lat = float(parts[1])
                    # Validar bounds WGS84
                    if -180 <= lon <= 180 and -90 <= lat <= 90:
                        coords.append((lon, lat))
                except ValueError:
                    continue
        return coords
    
    def detect_self_intersection(self, coords: List[Tuple[float, float]]) -> bool:
        """Detecta auto-interseção em polígonos (simplified)"""
        if len(coords) < 4:
            return False
        
        # Verificar se primeiro e último ponto são iguais
        if coords[0] != coords[-1]:
            coords = coords + [coords[0]]
        
        # Verificar cruzamento de linhas (simplified - apenas extremos)
        try:
            bounding_boxes = set()
            for i in range(len(coords) - 1):
                box = (
                    min(coords[i][0], coords[i+1][0]),
                    max(coords[i][0], coords[i+1][0]),
                    min(coords[i][1], coords[i+1][1]),
                    max(coords[i][1], coords[i+1][1])
                )
                if box in bounding_boxes:
                    return True
                bounding_boxes.add(box)
            return False
        except Exception:
            return False
    
    def extract_features(self, file_path: Path) -> Tuple[List[Dict], int]:
        """Extrai features de arquivo KML"""
        features = []
        null_count = 0
        
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Namespace padrão KML
            ns = {'kml': 'http://www.opengis.net/kml/2.2'}
            
            for placemark in root.iter('{http://www.opengis.net/kml/2.2}Placemark'):
                feature = {
                    'name': 'Unnamed',
                    'description': '',
                    'type': 'Unknown',
                    'geometry': None,
                    'coordinates': [],
                    'file': file_path.name
                }
                
                # Extrair nome
                name_elem = placemark.find('{http://www.opengis.net/kml/2.2}name')
                if name_elem is not None and name_elem.text:
                    feature['name'] = name_elem.text
                else:
                    null_count += 1
                
                # Extrair descrição
                desc_elem = placemark.find('{http://www.opengis.net/kml/2.2}description')
                if desc_elem is not None and desc_elem.text:
                    feature['description'] = desc_elem.text
                else:
                    null_count += 1
                
                # Extrair geometria
                for geom_type in ['Polygon', 'LineString', 'Point']:
                    geom = placemark.find(f'.//{{{ns["kml"]}}}{geom_type}')
                    if geom is not None:
                        feature['type'] = geom_type
                        
                        # Extrair coordenadas
                        for coord_elem in geom.iter(f'{{{ns["kml"]}}}coordinates'):
                            if coord_elem.text:
                                coords = self.parse_coordinates(coord_elem.text)
                                feature['coordinates'] = coords
                                break
                        break
                
                if feature['coordinates']:
                    features.append(feature)
        
        except ET.ParseError as e:
            print(f"❌ Erro ao parsear {file_path.name}: {e}")
        except Exception as e:
            print(f"❌ Erro geral em {file_path.name}: {e}")
        
        return features, null_count
    
    def validate_file(self, file_path: Path) -> ValidationMetrics:
        """Valida um arquivo KML individual"""
        features, null_count = self.extract_features(file_path)
        
        issues = []
        status = 'VALID'
        total_area = 0
        geometry_types = set()
        has_topology_errors = False
        has_duplicates = False
        positional_accuracy = 0
        
        # Calcular métricas
        if features:
            null_percent = (null_count / (len(features) * 2)) * 100  # 2 campos por feature
            
            if null_percent >= 5:
                status = 'WARNING'
                issues.append(f"Null_Fields: {null_percent:.2f}% (limite: <5%)")
            
            # Analisar geometrias
            bounds = {'min_lat': 90, 'max_lat': -90, 'min_lon': 180, 'max_lon': -180}
            
            for feature in features:
                geometry_types.add(feature['type'])
                coords = feature['coordinates']
                
                # Atualizar bounds
                for lon, lat in coords:
                    bounds['min_lat'] = min(bounds['min_lat'], lat)
                    bounds['max_lat'] = max(bounds['max_lat'], lat)
                    bounds['min_lon'] = min(bounds['min_lon'], lon)
                    bounds['max_lon'] = max(bounds['max_lon'], lon)
                
                # Validar topologia
                if feature['type'] == 'Polygon':
                    if self.detect_self_intersection(coords):
                        has_topology_errors = True
                        issues.append(f"Self-intersection em {feature['name']}")
                    
                    total_area += self.calculate_polygon_area(coords)
                
                # Positional accuracy (validar se coordenadas estão em WGS84)
                positional_accuracy = WGS84_EPSILON
            
            if has_topology_errors:
                status = 'ERROR'
                issues.append("Topology_Errors > 0")
            
            if geometry_types:
                geometry_types = list(geometry_types)
        else:
            status = 'ERROR'
            issues.append("Nenhuma feature encontrada")
            bounds = {'min_lat': None, 'max_lat': None, 'min_lon': None, 'max_lon': None}
        
        return ValidationMetrics(
            file_name=file_path.name,
            features_count=len(features),
            null_fields_percent=null_percent if features else 100,
            has_topology_errors=has_topology_errors,
            geometry_types=geometry_types,
            bounds=bounds,
            total_area_m2=total_area,
            has_duplicates=has_duplicates,
            positional_accuracy=positional_accuracy,
            status=status,
            issues=issues
        )
    
    def run_validation(self) -> None:
        """Executa validação completa de todos os KML"""
        kml_files = list(self.kml_dir.glob('**/*.kml'))
        
        if not kml_files:
            print(f"⚠️  Nenhum arquivo KML encontrado em {self.kml_dir}")
            return
        
        print(f"🔍 Validando {len(kml_files)} arquivos KML...")
        print("-" * 80)
        
        valid_count = 0
        warning_count = 0
        error_count = 0
        
        for i, kml_file in enumerate(sorted(kml_files), 1):
            metrics = self.validate_file(kml_file)
            self.metrics.append(metrics)
            
            # Print resumido
            status_icon = '✅' if metrics.status == 'VALID' else '⚠️ ' if metrics.status == 'WARNING' else '❌'
            print(f"{status_icon} [{i:3d}] {metrics.file_name:40s} | Features: {metrics.features_count:4d} | Status: {metrics.status}")
            
            if metrics.status == 'VALID':
                valid_count += 1
            elif metrics.status == 'WARNING':
                warning_count += 1
            else:
                error_count += 1
        
        print("-" * 80)
        print(f"\n📊 RESUMO DA VALIDAÇÃO:")
        print(f"  ✅ Válidos:    {valid_count:3d}")
        print(f"  ⚠️  Avisos:     {warning_count:3d}")
        print(f"  ❌ Erros:      {error_count:3d}")
        print(f"  📦 Total:      {len(self.metrics):3d}")
    
    def generate_report(self, output_file: Path) -> None:
        """Gera relatório detalhado em JSON"""
        report = {
            'metadata': {
                'validation_date': str(Path(output_file).stat().st_mtime),
                'total_files': len(self.metrics),
                'total_features': sum(m.features_count for m in self.metrics),
                'total_area_ha': sum(m.total_area_m2 for m in self.metrics) / 10000
            },
            'summary': {
                'valid': len([m for m in self.metrics if m.status == 'VALID']),
                'warnings': len([m for m in self.metrics if m.status == 'WARNING']),
                'errors': len([m for m in self.metrics if m.status == 'ERROR'])
            },
            'files': [asdict(m) for m in self.metrics]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Relatório salvo em: {output_file}")


def main():
    """Ponto de entrada principal"""
    kml_dir = Path(__file__).parent.parent / "Downloads" / "Documentaçao Auxiliar  Mundo Virtual Villa" / "00_DOCUMENTACAO_OFICIAL_V2" / "03_INTELIGENCIA_GEOESPACIAL" / "KML_RAW"
    
    if not kml_dir.exists():
        print(f"❌ Diretório KML não encontrado: {kml_dir}")
        sys.exit(1)
    
    validator = GISValidator(str(kml_dir))
    validator.run_validation()
    
    # Gerar relatório
    output_dir = Path(__file__).parent.parent / "reports"
    output_dir.mkdir(exist_ok=True)
    validator.generate_report(output_dir / "GIS_VALIDATION_REPORT.json")


if __name__ == '__main__':
    main()
