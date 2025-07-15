from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import base64
from io import BytesIO
from PIL import Image
import cv2
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

class DiabeticFootPredictor:
    def __init__(self):
        # Initialize ML models (in production, load pre-trained models)
        self.ulceration_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.progression_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.risk_threshold = 0.6
        
    def extract_neurotouch_features(self, neurotouch_data):
        """
        Extract features from neurotouch data
        Expected format: dict with monofilament, vibration, hot, cold perception data
        """
        features = {}
        
        # Monofilament features
        mono_data = neurotouch_data.get('monofilament', {})
        features['mono_risk_score'] = mono_data.get('risk_score', 0)
        features['mono_tactile_sensation'] = mono_data.get('tactile_sensation', 0)
        features['mono_affected_points'] = len(mono_data.get('affected_points', []))
        
        # Vibration features
        vibration_data = neurotouch_data.get('vibration', {})
        features['vibration_risk_score'] = vibration_data.get('risk_score', 0)
        features['vibration_threshold'] = vibration_data.get('threshold', 0)
        features['vibration_affected_points'] = len(vibration_data.get('affected_points', []))
        
        # Temperature perception features
        hot_data = neurotouch_data.get('hot_perception', {})
        features['hot_risk_score'] = hot_data.get('risk_score', 0)
        features['hot_threshold'] = hot_data.get('threshold', 0)
        
        cold_data = neurotouch_data.get('cold_perception', {})
        features['cold_risk_score'] = cold_data.get('risk_score', 0)
        features['cold_threshold'] = cold_data.get('threshold', 0)
        
        # Overall neuropathy score
        features['overall_neuropathy_score'] = np.mean([
            features['mono_risk_score'],
            features['vibration_risk_score'],
            features['hot_risk_score'],
            features['cold_risk_score']
        ])
        
        return features
    
    def extract_pedoscan_features(self, pedoscan_data):
        """
        Extract features from pedoscan pressure data
        Expected format: 2D array of pressure values in kPa
        """
        pressure_matrix = np.array(pedoscan_data['pressure_matrix'])
        
        features = {}
        
        # Basic pressure statistics
        features['max_pressure'] = np.max(pressure_matrix)
        features['mean_pressure'] = np.mean(pressure_matrix[pressure_matrix > 0])
        features['pressure_variance'] = np.var(pressure_matrix)
        features['pressure_std'] = np.std(pressure_matrix)
        
        # High pressure region analysis
        high_pressure_threshold = 200  # kPa
        high_pressure_mask = pressure_matrix > high_pressure_threshold
        features['high_pressure_area'] = np.sum(high_pressure_mask)
        features['high_pressure_percentage'] = features['high_pressure_area'] / np.sum(pressure_matrix > 0) * 100
        
        # Regional pressure analysis (divide foot into regions)
        height, width = pressure_matrix.shape
        
        # Forefoot region (top 1/3)
        forefoot = pressure_matrix[:height//3, :]
        features['forefoot_max_pressure'] = np.max(forefoot)
        features['forefoot_mean_pressure'] = np.mean(forefoot[forefoot > 0])
        
        # Midfoot region (middle 1/3)
        midfoot = pressure_matrix[height//3:2*height//3, :]
        features['midfoot_max_pressure'] = np.max(midfoot)
        features['midfoot_mean_pressure'] = np.mean(midfoot[midfoot > 0])
        
        # Rearfoot region (bottom 1/3)
        rearfoot = pressure_matrix[2*height//3:, :]
        features['rearfoot_max_pressure'] = np.max(rearfoot)
        features['rearfoot_mean_pressure'] = np.mean(rearfoot[rearfoot > 0])
        
        # Pressure gradient analysis
        grad_x = np.gradient(pressure_matrix, axis=1)
        grad_y = np.gradient(pressure_matrix, axis=0)
        features['pressure_gradient_magnitude'] = np.mean(np.sqrt(grad_x**2 + grad_y**2))
        
        # Center of pressure
        total_pressure = np.sum(pressure_matrix)
        if total_pressure > 0:
            y_coords, x_coords = np.mgrid[0:height, 0:width]
            features['cop_x'] = np.sum(x_coords * pressure_matrix) / total_pressure
            features['cop_y'] = np.sum(y_coords * pressure_matrix) / total_pressure
        else:
            features['cop_x'] = features['cop_y'] = 0
        
        return features
    
    def extract_foot_image_features(self, foot_images):
        """
        Extract features from foot images
        Expected format: list of base64 encoded images
        """
        features = {}
        
        # Process each image
        for i, img_base64 in enumerate(foot_images):
            try:
                # Decode base64 image
                img_data = base64.b64decode(img_base64.split(',')[1])
                img = Image.open(BytesIO(img_data))
                img_array = np.array(img)
                
                # Convert to grayscale if needed
                if len(img_array.shape) == 3:
                    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
                else:
                    gray = img_array
                
                # Basic image features
                features[f'img_{i}_mean_intensity'] = np.mean(gray)
                features[f'img_{i}_std_intensity'] = np.std(gray)
                features[f'img_{i}_contrast'] = np.max(gray) - np.min(gray)
                
                # Texture analysis using Laplacian
                laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
                features[f'img_{i}_texture_variance'] = laplacian_var
                
                # Edge detection
                edges = cv2.Canny(gray, 50, 150)
                features[f'img_{i}_edge_density'] = np.sum(edges > 0) / edges.size
                
                # Color analysis (if RGB image)
                if len(img_array.shape) == 3:
                    features[f'img_{i}_red_mean'] = np.mean(img_array[:,:,0])
                    features[f'img_{i}_green_mean'] = np.mean(img_array[:,:,1])
                    features[f'img_{i}_blue_mean'] = np.mean(img_array[:,:,2])
                    
                    # Color temperature indicator
                    red_ratio = np.mean(img_array[:,:,0]) / (np.mean(img_array[:,:,1]) + np.mean(img_array[:,:,2]) + 1e-8)
                    features[f'img_{i}_red_ratio'] = red_ratio
                
            except Exception as e:
                print(f"Error processing image {i}: {str(e)}")
                # Set default values if image processing fails
                features[f'img_{i}_mean_intensity'] = 0
                features[f'img_{i}_std_intensity'] = 0
                features[f'img_{i}_contrast'] = 0
                features[f'img_{i}_texture_variance'] = 0
                features[f'img_{i}_edge_density'] = 0
        
        return features
    
    def extract_arterial_features(self, arterial_data):
        """
        Extract features from arterial testing data
        Expected format: dict with ABI, TBI, and pressure measurements
        """
        features = {}
        
        # ABI (Ankle-Brachial Index) features
        abi_data = arterial_data.get('abi', {})
        features['abi_right'] = abi_data.get('right', 1.0)
        features['abi_left'] = abi_data.get('left', 1.0)
        features['abi_average'] = (features['abi_right'] + features['abi_left']) / 2
        features['abi_asymmetry'] = abs(features['abi_right'] - features['abi_left'])
        
        # TBI (Toe-Brachial Index) features
        tbi_data = arterial_data.get('tbi', {})
        features['tbi_right'] = tbi_data.get('right', 1.0)
        features['tbi_left'] = tbi_data.get('left', 1.0)
        features['tbi_average'] = (features['tbi_right'] + features['tbi_left']) / 2
        features['tbi_asymmetry'] = abs(features['tbi_right'] - features['tbi_left'])
        
        # Pressure measurements
        pressures = arterial_data.get('pressures', {})
        
        # Arm pressures
        features['arm_pressure_right'] = pressures.get('arm_right', 120)
        features['arm_pressure_left'] = pressures.get('arm_left', 120)
        
        # Ankle pressures
        features['ankle_pressure_right'] = pressures.get('ankle_right', 120)
        features['ankle_pressure_left'] = pressures.get('ankle_left', 120)
        
        # Toe pressures
        features['toe_pressure_right'] = pressures.get('toe_right', 100)
        features['toe_pressure_left'] = pressures.get('toe_left', 100)
        
        # Pressure gradients
        features['pressure_gradient_right'] = features['arm_pressure_right'] - features['toe_pressure_right']
        features['pressure_gradient_left'] = features['arm_pressure_left'] - features['toe_pressure_left']
        
        # Vascular risk indicators
        features['vascular_risk_score'] = 0
        if features['abi_average'] < 0.9:
            features['vascular_risk_score'] += 2
        if features['tbi_average'] < 0.7:
            features['vascular_risk_score'] += 2
        if features['abi_average'] > 1.4:  # Non-compressible vessels
            features['vascular_risk_score'] += 1
        
        return features
    
    def predict_ulceration_risk(self, combined_features):
        """
        Predict ulceration risk based on combined features
        """
        # Extract key risk factors
        risk_factors = [
            combined_features.get('overall_neuropathy_score', 0),
            combined_features.get('max_pressure', 0) / 400,  # Normalize pressure
            combined_features.get('high_pressure_percentage', 0) / 100,
            combined_features.get('vascular_risk_score', 0) / 4,  # Normalize vascular risk
            combined_features.get('abi_average', 1.0),
            combined_features.get('tbi_average', 1.0)
        ]
        
        # Simple risk calculation (in production, use trained ML model)
        base_risk = 0.1
        
        # Neuropathy contribution
        neuropathy_risk = combined_features.get('overall_neuropathy_score', 0) * 0.3
        
        # Pressure contribution
        pressure_risk = min(combined_features.get('max_pressure', 0) / 400, 1.0) * 0.25
        
        # Vascular contribution
        vascular_risk = combined_features.get('vascular_risk_score', 0) / 4 * 0.2
        
        # ABI contribution
        abi_risk = max(0, 0.9 - combined_features.get('abi_average', 1.0)) * 0.15
        
        # TBI contribution
        tbi_risk = max(0, 0.7 - combined_features.get('tbi_average', 1.0)) * 0.1
        
        total_risk = base_risk + neuropathy_risk + pressure_risk + vascular_risk + abi_risk + tbi_risk
        
        return min(total_risk, 1.0)
    
    def predict_progression(self, combined_features, timeframe_years):
        """
        Predict disease progression over time
        """
        current_risk = self.predict_ulceration_risk(combined_features)
        
        # Time-based progression factors
        progression_rates = {
            'neuropathy': 0.05 * timeframe_years,
            'deformity': 0.03 * timeframe_years,
            'pressure': 0.04 * timeframe_years,
            'vascular': 0.02 * timeframe_years
        }
        
        # Calculate progression for each component
        progression = {}
        progression['ulceration_risk'] = min(current_risk * (1 + 0.1 * timeframe_years), 1.0)
        progression['neuropathy_decline'] = progression_rates['neuropathy'] * combined_features.get('overall_neuropathy_score', 0)
        progression['pressure_increase'] = progression_rates['pressure'] * combined_features.get('max_pressure', 0)
        progression['deformity_progression'] = progression_rates['deformity'] * timeframe_years
        
        return progression
    
    def generate_recommendations(self, combined_features, risk_level):
        """
        Generate intervention recommendations based on risk analysis
        """
        recommendations = []
        
        # High neuropathy risk
        if combined_features.get('overall_neuropathy_score', 0) > 0.6:
            recommendations.append({
                'intervention': 'Neuropathy Management',
                'timing': '3 months',
                'urgency': 'Critical',
                'effectiveness': 70,
                'description': 'Immediate neuropathy assessment and management required'
            })
        
        # High pressure risk
        if combined_features.get('max_pressure', 0) > 250:
            recommendations.append({
                'intervention': 'Pressure Offloading',
                'timing': '2 months',
                'urgency': 'Critical',
                'effectiveness': 90,
                'description': 'Custom pressure redistributing footwear needed'
            })
        
        # Vascular risk
        if combined_features.get('vascular_risk_score', 0) > 2:
            recommendations.append({
                'intervention': 'Vascular Assessment',
                'timing': '1 month',
                'urgency': 'High',
                'effectiveness': 75,
                'description': 'Comprehensive vascular evaluation required'
            })
        
        # General recommendations based on risk level
        if risk_level > 0.6:
            recommendations.append({
                'intervention': 'Custom Orthotics',
                'timing': '6 months',
                'urgency': 'High',
                'effectiveness': 85,
                'description': 'Custom orthotic devices to redistribute pressure'
            })
        
        if risk_level > 0.4:
            recommendations.append({
                'intervention': 'Enhanced Monitoring',
                'timing': 'Immediate',
                'urgency': 'High',
                'effectiveness': 60,
                'description': 'Increased frequency of foot examinations'
            })
        
        return recommendations

# Initialize predictor
predictor = DiabeticFootPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extract features from all input modalities
        neurotouch_features = predictor.extract_neurotouch_features(data.get('neurotouch', {}))
        pedoscan_features = predictor.extract_pedoscan_features(data.get('pedoscan', {}))
        image_features = predictor.extract_foot_image_features(data.get('foot_images', []))
        arterial_features = predictor.extract_arterial_features(data.get('arterial', {}))
        
        # Combine all features
        combined_features = {
            **neurotouch_features,
            **pedoscan_features,
            **image_features,
            **arterial_features
        }
        
        # Predict ulceration risk
        ulceration_risk = predictor.predict_ulceration_risk(combined_features)
        
        # Generate predictions for different timeframes
        timeframe_predictions = {}
        for years in [1, 2, 3, 5, 10]:
            progression = predictor.predict_progression(combined_features, years)
            timeframe_predictions[f'year_{years}'] = progression
        
        # Generate recommendations
        recommendations = predictor.generate_recommendations(combined_features, ulceration_risk)
        
        # Prepare response
        response = {
            'patient_id': data.get('patient_id'),
            'timestamp': datetime.now().isoformat(),
            'risk_assessment': {
                'current_ulceration_risk': ulceration_risk,
                'risk_level': 'Low' if ulceration_risk < 0.3 else 'Moderate' if ulceration_risk < 0.6 else 'High',
                'confidence': 0.85  # This would come from model uncertainty in production
            },
            'feature_analysis': {
                'neurotouch_score': neurotouch_features.get('overall_neuropathy_score', 0),
                'pressure_analysis': {
                    'max_pressure': pedoscan_features.get('max_pressure', 0),
                    'high_pressure_percentage': pedoscan_features.get('high_pressure_percentage', 0)
                },
                'vascular_analysis': {
                    'abi_average': arterial_features.get('abi_average', 1.0),
                    'tbi_average': arterial_features.get('tbi_average', 1.0),
                    'vascular_risk_score': arterial_features.get('vascular_risk_score', 0)
                }
            },
            'progression_predictions': timeframe_predictions,
            'recommendations': recommendations
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/data-format', methods=['GET'])
def get_data_format():
    """
    Return the expected data format for all inputs
    """
    format_spec = {
        'neurotouch': {
            'description': 'Neurotouch sensory testing data',
            'format': {
                'monofilament': {
                    'risk_score': 'float (0-1)',
                    'tactile_sensation': 'float (0-1)',
                    'affected_points': 'list of point IDs'
                },
                'vibration': {
                    'risk_score': 'float (0-1)',
                    'threshold': 'float (vibration threshold in Hz)',
                    'affected_points': 'list of point IDs'
                },
                'hot_perception': {
                    'risk_score': 'float (0-1)',
                    'threshold': 'float (temperature threshold in °C)'
                },
                'cold_perception': {
                    'risk_score': 'float (0-1)',
                    'threshold': 'float (temperature threshold in °C)'
                }
            }
        },
        'pedoscan': {
            'description': 'Pedoscan pressure mapping data',
            'format': {
                'pressure_matrix': '2D array of pressure values in kPa',
                'example_size': '64x32 or similar grid',
                'units': 'kPa'
            }
        },
        'foot_images': {
            'description': 'Foot images for visual analysis',
            'format': {
                'images': 'list of base64 encoded images',
                'count': '5 images recommended',
                'format': 'base64 string with data:image/jpeg;base64, prefix'
            }
        },
        'arterial': {
            'description': 'Arterial testing data',
            'format': {
                'abi': {
                    'right': 'float (ABI value)',
                    'left': 'float (ABI value)'
                },
                'tbi': {
                    'right': 'float (TBI value)',
                    'left': 'float (TBI value)'
                },
                'pressures': {
                    'arm_right': 'int (mmHg)',
                    'arm_left': 'int (mmHg)',
                    'ankle_right': 'int (mmHg)',
                    'ankle_left': 'int (mmHg)',
                    'toe_right': 'int (mmHg)',
                    'toe_left': 'int (mmHg)'
                }
            }
        }
    }
    
    return jsonify(format_spec)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
