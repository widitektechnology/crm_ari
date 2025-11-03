"""
AI Application Service
Manages AI operations including email classification and response generation
"""
import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from .base_service import BaseApplicationService
from ..unit_of_work.base_unit_of_work import UnitOfWork
from ...modules.ai.email_classifier import EmailClassifier, ClassificationResult, ModelMetrics
from ...modules.ai.conversational_agent import ConversationalAgent, ResponseContext, GeneratedResponse, ResponseTone

logger = logging.getLogger(__name__)


class AIService(BaseApplicationService):
    """
    Application service for AI operations
    Implements Service Layer pattern for AI-powered email processing
    """
    
    def __init__(self, unit_of_work: UnitOfWork, model_path: Optional[str] = None):
        super().__init__(unit_of_work)
        
        # Initialize AI components
        self.model_path = model_path or "./models/email_classifier.joblib"
        self.email_classifier = EmailClassifier(self.model_path)
        self.conversational_agent = ConversationalAgent()
        
        # Initialize classifier if model exists
        self._initialize_classifier()
    
    def _initialize_classifier(self):
        """Initialize email classifier with existing model or train new one"""
        try:
            if os.path.exists(self.model_path):
                self.email_classifier.load_model()
                logger.info("Email classifier model loaded successfully")
            else:
                logger.info("No existing model found, training new classifier")
                self.train_classifier()
        except Exception as e:
            logger.warning(f"Failed to initialize classifier: {str(e)}")
    
    # Email Classification Operations
    async def train_classifier(self, 
                             training_texts: Optional[List[str]] = None,
                             training_labels: Optional[List[str]] = None) -> ModelMetrics:
        """Train or retrain the email classification model"""
        
        async def _train_operation():
            logger.info("Starting email classifier training")
            
            # Train the model
            metrics = self.email_classifier.train_model(training_texts, training_labels)
            
            logger.info(f"Classifier training completed. Accuracy: {metrics.accuracy:.3f}")
            
            # In a real implementation, you might want to store training metrics
            # await self._store_training_metrics(metrics)
            
            return metrics
        
        return await self._execute_with_transaction(_train_operation)
    
    async def classify_email(self, 
                           email_content: str, 
                           subject: str = "",
                           sender_email: str = "") -> ClassificationResult:
        """Classify an email and return the predicted category"""
        
        async def _classify_operation():
            if not self.email_classifier.is_trained:
                raise ValueError("Email classifier is not trained. Please train the model first.")
            
            # Classify email
            result = self.email_classifier.classify_email(email_content, subject)
            
            # Log classification for audit purposes
            logger.info(f"Email from {sender_email} classified as '{result.predicted_category}' "
                       f"with confidence {result.confidence:.3f}")
            
            # In a real implementation, you might want to store classification results
            # await self._store_classification_result(result, sender_email)
            
            return result
        
        return await self._execute_with_transaction(_classify_operation)
    
    # Conversational Agent Operations
    async def generate_email_response(self,
                                    original_email_content: str,
                                    original_subject: str,
                                    sender_name: Optional[str] = None,
                                    sender_email: str = "",
                                    company_name: str = "Nuestra Empresa",
                                    agent_name: str = "Joel Araujo") -> GeneratedResponse:
        """Generate automated email response using conversational AI"""
        
        async def _generate_response_operation():
            # First, classify the email
            classification = await self.classify_email(original_email_content, original_subject, sender_email)
            
            # Create response context
            context = ResponseContext(
                sender_name=sender_name,
                sender_email=sender_email,
                original_subject=original_subject,
                original_content=original_email_content,
                classification_category=classification.predicted_category,
                classification_confidence=classification.confidence,
                company_name=company_name,
                agent_name=agent_name
            )
            
            # Generate response
            response = self.conversational_agent.generate_response(context)
            
            logger.info(f"Generated response for email from {sender_email}. "
                       f"Category: {classification.predicted_category}, "
                       f"Requires review: {response.requires_human_review}")
            
            # In a real implementation, you might want to store the generated response
            # await self._store_generated_response(response, sender_email)
            
            return response
        
        return await self._execute_with_transaction(_generate_response_operation)
    
    async def process_email_workflow(self,
                                   email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Complete email processing workflow: classify + generate response + route"""
        
        async def _process_workflow_operation():
            email_content = email_data.get('content', '')
            subject = email_data.get('subject', '')
            sender_name = email_data.get('sender_name')
            sender_email = email_data.get('sender_email', '')
            
            # Step 1: Classify email
            classification = await self.classify_email(email_content, subject, sender_email)
            
            # Step 2: Determine routing
            routing_info = self._determine_email_routing(classification)
            
            # Step 3: Generate automated response
            response = await self.generate_email_response(
                email_content, subject, sender_name, sender_email
            )
            
            # Step 4: Create workflow result
            workflow_result = {
                'email_id': email_data.get('id'),
                'sender_email': sender_email,
                'classification': {
                    'category': classification.predicted_category,
                    'confidence': classification.confidence,
                    'all_probabilities': classification.probabilities
                },
                'routing': routing_info,
                'generated_response': {
                    'subject': response.subject,
                    'content': response.content,
                    'confidence': response.confidence,
                    'requires_human_review': response.requires_human_review,
                    'suggested_actions': response.suggested_actions
                },
                'workflow_status': 'completed',
                'processed_at': datetime.now().isoformat(),
                'processing_time': classification.processing_time + response.processing_time
            }
            
            logger.info(f"Email workflow completed for {sender_email}. "
                       f"Routed to: {routing_info['department']}")
            
            return workflow_result
        
        return await self._execute_with_transaction(_process_workflow_operation)
    
    def _determine_email_routing(self, classification: ClassificationResult) -> Dict[str, Any]:
        """Determine email routing based on classification"""
        routing_rules = {
            'soporte_tecnico': {
                'department': 'Technical Support',
                'priority': 'high' if classification.confidence > 0.8 else 'normal',
                'sla_hours': 24,
                'assigned_team': 'tech_support_team@company.com'
            },
            'finanzas': {
                'department': 'Finance',
                'priority': 'normal',
                'sla_hours': 48,
                'assigned_team': 'finance_team@company.com'
            },
            'recursos_humanos': {
                'department': 'Human Resources',
                'priority': 'normal',
                'sla_hours': 48,
                'assigned_team': 'hr_team@company.com'
            },
            'ventas': {
                'department': 'Sales',
                'priority': 'high',
                'sla_hours': 12,
                'assigned_team': 'sales_team@company.com'
            },
            'marketing': {
                'department': 'Marketing',
                'priority': 'low',
                'sla_hours': 72,
                'assigned_team': 'marketing_team@company.com'
            },
            'administracion': {
                'department': 'Administration',
                'priority': 'normal',
                'sla_hours': 48,
                'assigned_team': 'admin_team@company.com'
            },
            'general': {
                'department': 'Customer Service',
                'priority': 'normal',
                'sla_hours': 24,
                'assigned_team': 'support_team@company.com'
            }
        }
        
        routing = routing_rules.get(classification.predicted_category, routing_rules['general'])
        
        # Adjust priority based on confidence
        if classification.confidence < 0.6:
            routing['priority'] = 'review_required'
            routing['notes'] = 'Low classification confidence - requires human review'
        
        return routing
    
    # Model Management Operations
    async def get_classifier_info(self) -> Dict[str, Any]:
        """Get information about the current classifier model"""
        
        async def _get_info_operation():
            model_info = self.email_classifier.get_model_info()
            
            # Add additional runtime information
            runtime_info = {
                'model_file_exists': os.path.exists(self.model_path),
                'model_path': self.model_path,
                'last_loaded': None,  # Would track in real implementation
                'classifications_count': 0,  # Would track in real implementation
            }
            
            return {**model_info, **runtime_info}
        
        return await self._execute_with_transaction(_get_info_operation)
    
    async def update_system_prompt(self, new_prompt: str) -> bool:
        """Update the conversational agent's system prompt"""
        
        async def _update_prompt_operation():
            self.conversational_agent.customize_system_prompt(new_prompt)
            
            # In a real implementation, you might want to store the prompt change
            # await self._store_system_prompt_change(new_prompt)
            
            logger.info("System prompt updated successfully")
            return True
        
        return await self._execute_with_transaction(_update_prompt_operation)
    
    # Analytics and Reporting
    async def get_classification_analytics(self, 
                                         date_from: Optional[str] = None,
                                         date_to: Optional[str] = None) -> Dict[str, Any]:
        """Get analytics about email classifications"""
        
        async def _get_analytics_operation():
            # In a real implementation, this would query stored classification results
            # For now, return example analytics
            
            analytics = {
                'period': {
                    'from': date_from or 'N/A',
                    'to': date_to or 'N/A'
                },
                'total_classifications': 0,  # Would query from database
                'category_distribution': {
                    'soporte_tecnico': 25,
                    'finanzas': 20,
                    'ventas': 30,
                    'recursos_humanos': 10,
                    'general': 15
                },
                'confidence_distribution': {
                    'high_confidence': 70,  # >0.8
                    'medium_confidence': 25,  # 0.6-0.8
                    'low_confidence': 5  # <0.6
                },
                'average_confidence': 0.82,
                'accuracy_metrics': {
                    'last_evaluation': 'N/A',
                    'accuracy': 0.89,
                    'precision': 0.87,
                    'recall': 0.85,
                    'f1_score': 0.86
                }
            }
            
            return analytics
        
        return await self._execute_with_transaction(_get_analytics_operation)
    
    async def get_response_analytics(self) -> Dict[str, Any]:
        """Get analytics about generated responses"""
        
        async def _get_response_analytics_operation():
            # Get statistics from conversational agent
            agent_stats = self.conversational_agent.get_response_statistics()
            
            # Add additional analytics
            analytics = {
                **agent_stats,
                'human_review_rate': 0.15,  # Would calculate from real data
                'response_satisfaction': 0.92,  # Would track from feedback
                'average_response_time': 0.5,  # seconds
                'most_common_categories': [
                    'soporte_tecnico',
                    'ventas',
                    'finanzas'
                ]
            }
            
            return analytics
        
        return await self._execute_with_transaction(_get_response_analytics_operation)
    
    # Validation and Business Rules
    async def _validate_business_rules(self, **kwargs) -> List[str]:
        """Validate business rules for AI operations"""
        errors = []
        
        # Validate email content
        email_content = kwargs.get('email_content', '')
        if not email_content or len(email_content.strip()) < 10:
            errors.append("Email content is too short for reliable classification")
        
        # Validate sender email
        sender_email = kwargs.get('sender_email', '')
        if sender_email and '@' not in sender_email:
            errors.append("Invalid sender email format")
        
        return errors