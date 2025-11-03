"""
Email Classification AI Module
Implements text classification for automatic email routing
"""
import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import SnowballStemmer

logger = logging.getLogger(__name__)


@dataclass
class ClassificationResult:
    """Result of email classification"""
    predicted_category: str
    confidence: float
    probabilities: Dict[str, float]
    processing_time: float
    timestamp: datetime


@dataclass
class ModelMetrics:
    """Machine learning model evaluation metrics"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    classification_report: str
    training_time: float
    model_size: int


class EmailTextPreprocessor:
    """
    Text preprocessing pipeline for email classification
    Handles tokenization, cleaning, and feature extraction
    """
    
    def __init__(self, language: str = 'spanish'):
        self.language = language
        self.stemmer = SnowballStemmer(language)
        
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        
        self.stop_words = set(stopwords.words(language))
    
    def preprocess_text(self, text: str) -> str:
        """
        Comprehensive text preprocessing
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove email addresses
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' EMAIL ', text)
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', ' URL ', text)
        
        # Remove phone numbers
        text = re.sub(r'\b\d{2,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b', ' PHONE ', text)
        
        # Remove extra whitespace and special characters
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        # Tokenize
        tokens = word_tokenize(text, language=self.language)
        
        # Remove stopwords and short tokens
        tokens = [token for token in tokens if token not in self.stop_words and len(token) > 2]
        
        # Apply stemming
        tokens = [self.stemmer.stem(token) for token in tokens]
        
        return ' '.join(tokens)
    
    def extract_email_features(self, email_content: str, subject: str = "") -> Dict[str, Any]:
        """
        Extract additional features from email content
        """
        features = {}
        
        # Basic text statistics
        features['text_length'] = len(email_content)
        features['word_count'] = len(email_content.split())
        features['sentence_count'] = len(email_content.split('.'))
        
        # Subject line features
        features['subject_length'] = len(subject)
        features['subject_word_count'] = len(subject.split())
        
        # Keyword presence (business context)
        business_keywords = [
            'factura', 'pago', 'pedido', 'presupuesto', 'contrato',
            'soporte', 'técnico', 'problema', 'error', 'ayuda',
            'recursos humanos', 'nómina', 'empleado', 'contratación',
            'finanzas', 'contabilidad', 'impuestos', 'declaración'
        ]
        
        for keyword in business_keywords:
            features[f'has_{keyword}'] = 1 if keyword in email_content.lower() else 0
        
        # Urgency indicators
        urgency_words = ['urgente', 'inmediato', 'rápido', 'pronto', 'asap']
        features['urgency_score'] = sum(1 for word in urgency_words if word in email_content.lower())
        
        return features


class EmailClassifier:
    """
    Email classification system using SVM with RBF kernel
    Implements non-linear classification for complex email categorization
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.preprocessor = EmailTextPreprocessor()
        self.pipeline = None
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        
        # Classification categories
        self.categories = [
            'soporte_tecnico',      # Technical support
            'finanzas',             # Finance/Accounting
            'recursos_humanos',     # Human Resources
            'ventas',               # Sales
            'marketing',            # Marketing
            'administracion',       # Administration
            'general'               # General inquiries
        ]
    
    def create_pipeline(self) -> Pipeline:
        """
        Create ML pipeline with TF-IDF vectorization and SVM classifier
        """
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),  # Use unigrams and bigrams
                min_df=2,            # Ignore terms that appear in less than 2 documents
                max_df=0.95,         # Ignore terms that appear in more than 95% of documents
                stop_words=None      # We handle stopwords in preprocessing
            )),
            ('classifier', SVC(
                kernel='rbf',        # Radial Basis Function kernel for non-linear classification
                C=1.0,               # Regularization parameter
                gamma='scale',       # Kernel coefficient
                probability=True,    # Enable probability estimates
                random_state=42
            ))
        ])
        
        return pipeline
    
    def prepare_training_data(self) -> Tuple[List[str], List[str]]:
        """
        Generate example training data for email classification
        In a real implementation, this would load from a database or file
        """
        training_data = [
            # Technical Support
            ("Mi aplicación no funciona correctamente, aparece un error 500", "soporte_tecnico"),
            ("Problema con la conexión a la base de datos", "soporte_tecnico"),
            ("El sistema está muy lento, necesito ayuda técnica", "soporte_tecnico"),
            ("Error al generar reportes, código de error 404", "soporte_tecnico"),
            ("No puedo acceder al panel de administración", "soporte_tecnico"),
            
            # Finance
            ("Necesito la factura del mes pasado para contabilidad", "finanzas"),
            ("Consulta sobre el estado de pago de la factura", "finanzas"),
            ("Solicitud de presupuesto para nuevos servicios", "finanzas"),
            ("Información sobre impuestos y declaraciones", "finanzas"),
            ("Estado de cuenta y movimientos bancarios", "finanzas"),
            
            # Human Resources
            ("Solicitud de vacaciones para el próximo mes", "recursos_humanos"),
            ("Consulta sobre mi nómina y deducciones", "recursos_humanos"),
            ("Proceso de contratación para nuevo empleado", "recursos_humanos"),
            ("Políticas de empresa y beneficios laborales", "recursos_humanos"),
            ("Evaluación de desempeño y promociones", "recursos_humanos"),
            
            # Sales
            ("Interesado en sus productos, necesito información", "ventas"),
            ("Cotización para servicios empresariales", "ventas"),
            ("Seguimiento de propuesta comercial enviada", "ventas"),
            ("Condiciones de venta y descuentos disponibles", "ventas"),
            ("Renovación de contrato comercial", "ventas"),
            
            # Marketing
            ("Propuesta de colaboración para evento", "marketing"),
            ("Campaña publicitaria en redes sociales", "marketing"),
            ("Análisis de mercado y competencia", "marketing"),
            ("Diseño de material promocional", "marketing"),
            ("Estrategia de marketing digital", "marketing"),
            
            # Administration
            ("Actualización de datos de contacto empresa", "administracion"),
            ("Solicitud de certificados y documentación", "administracion"),
            ("Cambio de dirección fiscal de la empresa", "administracion"),
            ("Gestión de contratos con proveedores", "administracion"),
            ("Política de calidad y procedimientos", "administracion"),
            
            # General
            ("Información general sobre la empresa", "general"),
            ("Consulta sobre horarios de atención", "general"),
            ("Ubicación de oficinas y contacto", "general"),
            ("Servicios disponibles y características", "general"),
            ("Dudas generales sobre funcionamiento", "general")
        ]
        
        texts, labels = zip(*training_data)
        return list(texts), list(labels)
    
    def train_model(self, texts: Optional[List[str]] = None, labels: Optional[List[str]] = None) -> ModelMetrics:
        """
        Train the email classification model
        """
        start_time = datetime.now()
        
        # Use provided data or generate example data
        if texts is None or labels is None:
            texts, labels = self.prepare_training_data()
        
        logger.info(f"Training model with {len(texts)} samples")
        
        # Preprocess texts
        processed_texts = [self.preprocessor.preprocess_text(text) for text in texts]
        
        # Encode labels
        encoded_labels = self.label_encoder.fit_transform(labels)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            processed_texts, encoded_labels, test_size=0.2, random_state=42, stratify=encoded_labels
        )
        
        # Create and train pipeline
        self.pipeline = self.create_pipeline()
        self.pipeline.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.pipeline.predict(X_test)
        y_pred_proba = self.pipeline.predict_proba(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # Get class names for report
        class_names = self.label_encoder.classes_
        class_names = [self.label_encoder.inverse_transform([i])[0] for i in range(len(class_names))]
        
        report = classification_report(y_test, y_pred, target_names=class_names)
        
        training_time = (datetime.now() - start_time).total_seconds()
        
        self.is_trained = True
        
        # Save model if path provided
        if self.model_path:
            self.save_model()
        
        metrics = ModelMetrics(
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1_score=f1,
            classification_report=report,
            training_time=training_time,
            model_size=len(joblib.dumps(self.pipeline))
        )
        
        logger.info(f"Model trained successfully. Accuracy: {accuracy:.3f}, F1-Score: {f1:.3f}")
        return metrics
    
    def classify_email(self, email_content: str, subject: str = "") -> ClassificationResult:
        """
        Classify an email into one of the predefined categories
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before classification")
        
        start_time = datetime.now()
        
        # Combine subject and content
        full_text = f"{subject} {email_content}"
        
        # Preprocess text
        processed_text = self.preprocessor.preprocess_text(full_text)
        
        # Make prediction
        prediction = self.pipeline.predict([processed_text])[0]
        probabilities = self.pipeline.predict_proba([processed_text])[0]
        
        # Get category name
        predicted_category = self.label_encoder.inverse_transform([prediction])[0]
        
        # Get confidence (highest probability)
        confidence = max(probabilities)
        
        # Create probability dictionary
        category_names = [self.label_encoder.inverse_transform([i])[0] for i in range(len(probabilities))]
        prob_dict = dict(zip(category_names, probabilities))
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        result = ClassificationResult(
            predicted_category=predicted_category,
            confidence=confidence,
            probabilities=prob_dict,
            processing_time=processing_time,
            timestamp=datetime.now()
        )
        
        logger.info(f"Email classified as '{predicted_category}' with confidence {confidence:.3f}")
        return result
    
    def save_model(self):
        """Save trained model to disk"""
        if not self.is_trained or not self.model_path:
            raise ValueError("Cannot save untrained model or missing model path")
        
        model_data = {
            'pipeline': self.pipeline,
            'label_encoder': self.label_encoder,
            'categories': self.categories,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, self.model_path)
        logger.info(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model from disk"""
        if not self.model_path:
            raise ValueError("Model path not specified")
        
        try:
            model_data = joblib.load(self.model_path)
            self.pipeline = model_data['pipeline']
            self.label_encoder = model_data['label_encoder']
            self.categories = model_data['categories']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"Model loaded from {self.model_path}")
        except FileNotFoundError:
            logger.error(f"Model file not found: {self.model_path}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the trained model"""
        if not self.is_trained:
            return {"status": "not_trained"}
        
        return {
            "status": "trained",
            "categories": self.categories,
            "model_type": "SVM with RBF kernel",
            "feature_extraction": "TF-IDF",
            "preprocessing": "tokenization, stemming, stopword removal",
            "model_path": self.model_path
        }