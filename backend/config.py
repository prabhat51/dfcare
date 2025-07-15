import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # ML Model settings
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models')
    PREDICTION_CONFIDENCE_THRESHOLD = 0.7
    
    # Database settings (if you plan to add database later)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # API settings
    API_RATE_LIMIT = "100/hour"
    
class DevelopmentConfig(Config):
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

class ProductionConfig(Config):
    DEBUG = False
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
