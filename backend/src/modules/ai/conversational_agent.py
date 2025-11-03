"""
Conversational AI Agent
Implements AI agent for automated email responses
"""
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import re
import json

logger = logging.getLogger(__name__)


class ResponseTone(Enum):
    FORMAL = "formal"
    FRIENDLY = "friendly"
    TECHNICAL = "technical"
    APOLOGETIC = "apologetic"


class ResponseCategory(Enum):
    SUPPORT_ACKNOWLEDGMENT = "support_acknowledgment"
    FINANCE_INQUIRY = "finance_inquiry"
    HR_REQUEST = "hr_request"
    SALES_RESPONSE = "sales_response"
    GENERAL_INFO = "general_info"
    ESCALATION = "escalation"


@dataclass
class ResponseContext:
    """Context information for generating responses"""
    sender_name: Optional[str] = None
    sender_email: str = ""
    original_subject: str = ""
    original_content: str = ""
    classification_category: str = ""
    classification_confidence: float = 0.0
    company_name: str = "Nuestra Empresa"
    agent_name: str = "Joel Araujo"
    response_tone: ResponseTone = ResponseTone.FRIENDLY
    additional_info: Dict[str, Any] = None


@dataclass
class GeneratedResponse:
    """Generated email response"""
    subject: str
    content: str
    response_category: ResponseCategory
    confidence: float
    generated_at: datetime
    processing_time: float
    suggested_actions: List[str]
    requires_human_review: bool


class ConversationalAgent:
    """
    AI-powered conversational agent for email responses
    Generates contextual, personalized responses based on classification and business rules
    """
    
    def __init__(self, system_prompt: Optional[str] = None):
        self.system_prompt = system_prompt or (
            "Responde el correo en nombre de Joel Araujo, utiliza un lenguaje amigable y poco técnico. "
            "Mantén un tono profesional pero cercano, y proporciona información útil y clara."
        )
        
        # Response templates by category
        self.response_templates = self._initialize_response_templates()
        
        # Business rules for response generation
        self.business_rules = self._initialize_business_rules()
    
    def _initialize_response_templates(self) -> Dict[str, Dict[str, str]]:
        """Initialize response templates for different categories and tones"""
        return {
            "soporte_tecnico": {
                "friendly": {
                    "subject": "Re: {original_subject} - Hemos recibido tu consulta",
                    "greeting": "Hola {sender_name},",
                    "acknowledgment": "Gracias por contactarnos. He recibido tu consulta sobre el problema técnico que mencionas.",
                    "action": "Nuestro equipo técnico revisará tu caso y te responderemos con una solución en las próximas 24 horas.",
                    "additional": "Mientras tanto, puedes consultar nuestra base de conocimientos en nuestro portal de soporte.",
                    "closing": "Si tienes alguna duda adicional, no dudes en escribirnos.",
                    "signature": "Saludos cordiales,\nJoel Araujo\nEquipo de Soporte Técnico"
                },
                "technical": {
                    "subject": "Re: {original_subject} - Ticket de soporte #{ticket_number}",
                    "greeting": "Estimado/a {sender_name},",
                    "acknowledgment": "Hemos registrado su solicitud de soporte técnico con el número de ticket #{ticket_number}.",
                    "action": "El problema reportado será analizado por nuestros especialistas técnicos. Le proporcionaremos una actualización en un plazo máximo de 24 horas.",
                    "additional": "Para acelerar el proceso, puede proporcionarnos información adicional como capturas de pantalla o logs del sistema.",
                    "closing": "Mantendremos comunicación continua hasta resolver completamente su consulta.",
                    "signature": "Atentamente,\nJoel Araujo\nDepartamento de Soporte Técnico"
                }
            },
            "finanzas": {
                "friendly": {
                    "subject": "Re: {original_subject} - Información financiera",
                    "greeting": "Hola {sender_name},",
                    "acknowledgment": "Gracias por tu consulta sobre temas financieros. Entiendo que necesitas información sobre {topic}.",
                    "action": "He reenviado tu solicitud a nuestro departamento de finanzas, que se pondrá en contacto contigo pronto.",
                    "additional": "Si es urgente, también puedes llamarnos directamente al teléfono de administración.",
                    "closing": "Estamos aquí para ayudarte con cualquier tema financiero que necesites.",
                    "signature": "Un saludo,\nJoel Araujo\nAtención al Cliente"
                },
                "formal": {
                    "subject": "Re: {original_subject} - Consulta financiera",
                    "greeting": "Estimado/a {sender_name},",
                    "acknowledgment": "Acusamos recibo de su consulta relacionada con aspectos financieros de su cuenta.",
                    "action": "Su solicitud ha sido derivada al Departamento de Administración y Finanzas para su correspondiente gestión.",
                    "additional": "Recibirá respuesta detallada en un plazo no superior a 48 horas hábiles.",
                    "closing": "Agradecemos su confianza en nuestros servicios.",
                    "signature": "Cordialmente,\nJoel Araujo\nAtención al Cliente"
                }
            },
            "recursos_humanos": {
                "friendly": {
                    "subject": "Re: {original_subject} - Consulta de RRHH recibida",
                    "greeting": "Hola {sender_name},",
                    "acknowledgment": "He recibido tu consulta sobre recursos humanos. Entiendo que necesitas ayuda con {topic}.",
                    "action": "He enviado tu mensaje a nuestro equipo de RRHH, que conoce bien estos temas y podrá ayudarte mejor.",
                    "additional": "Por lo general, este tipo de consultas se resuelven en 1-2 días laborables.",
                    "closing": "Si tienes más preguntas, siempre puedes escribirnos de nuevo.",
                    "signature": "Saludos,\nJoel Araujo\nAtención al Cliente"
                }
            },
            "ventas": {
                "friendly": {
                    "subject": "Re: {original_subject} - ¡Gracias por tu interés!",
                    "greeting": "Hola {sender_name},",
                    "acknowledgment": "¡Qué alegría saber de tu interés en nuestros servicios! Me encanta poder ayudarte.",
                    "action": "He reenviado tu consulta a nuestro equipo comercial, que son los expertos y podrán darte toda la información que necesitas.",
                    "additional": "Mientras tanto, puedes echar un vistazo a nuestra página web donde encontrarás más detalles sobre lo que ofrecemos.",
                    "closing": "Espero que pronto podamos trabajar juntos. ¡Cualquier cosa que necesites, aquí estamos!",
                    "signature": "Un abrazo,\nJoel Araujo\nAtención al Cliente"
                }
            },
            "general": {
                "friendly": {
                    "subject": "Re: {original_subject} - Hemos recibido tu mensaje",
                    "greeting": "Hola {sender_name},",
                    "acknowledgment": "Gracias por escribirnos. He recibido tu mensaje y quiero asegurarme de que recibas la mejor ayuda posible.",
                    "action": "Voy a revisar tu consulta y dirigirla al equipo más adecuado para que puedan atenderte correctamente.",
                    "additional": "En breve recibirás una respuesta más detallada de la persona indicada.",
                    "closing": "Gracias por confiar en nosotros para resolver tus dudas.",
                    "signature": "Saludos cordiales,\nJoel Araujo\nAtención al Cliente"
                }
            }
        }
    
    def _initialize_business_rules(self) -> Dict[str, Any]:
        """Initialize business rules for response generation"""
        return {
            "escalation_keywords": [
                "urgente", "emergency", "crítico", "inmediato", "director", "gerente",
                "abogado", "legal", "demanda", "queja formal"
            ],
            "high_value_indicators": [
                "contrato", "partnership", "colaboración", "inversión", "presupuesto alto"
            ],
            "technical_keywords": [
                "api", "integración", "base de datos", "servidor", "código de error",
                "bug", "funcionalidad", "desarrollo"
            ],
            "financial_keywords": [
                "factura", "pago", "cobro", "presupuesto", "precio", "coste", "iva",
                "descuento", "refund", "reembolso"
            ]
        }
    
    def generate_response(self, context: ResponseContext) -> GeneratedResponse:
        """
        Generate contextual email response based on classification and context
        """
        start_time = datetime.now()
        
        # Analyze context and determine response strategy
        response_category = self._determine_response_category(context)
        response_tone = self._determine_response_tone(context)
        
        # Extract key information from original email
        extracted_info = self._extract_key_information(context.original_content)
        
        # Check for escalation needs
        needs_escalation = self._check_escalation_needs(context)
        
        # Generate response content
        response_content = self._generate_response_content(
            context, response_category, response_tone, extracted_info
        )
        
        # Generate subject line
        subject = self._generate_subject_line(context, response_category)
        
        # Determine confidence level
        confidence = self._calculate_response_confidence(context, extracted_info)
        
        # Generate suggested actions
        suggested_actions = self._generate_suggested_actions(context, extracted_info)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        response = GeneratedResponse(
            subject=subject,
            content=response_content,
            response_category=response_category,
            confidence=confidence,
            generated_at=datetime.now(),
            processing_time=processing_time,
            suggested_actions=suggested_actions,
            requires_human_review=needs_escalation or confidence < 0.7
        )
        
        logger.info(f"Generated response for category '{context.classification_category}' with confidence {confidence:.3f}")
        return response
    
    def _determine_response_category(self, context: ResponseContext) -> ResponseCategory:
        """Determine the appropriate response category"""
        category_mapping = {
            "soporte_tecnico": ResponseCategory.SUPPORT_ACKNOWLEDGMENT,
            "finanzas": ResponseCategory.FINANCE_INQUIRY,
            "recursos_humanos": ResponseCategory.HR_REQUEST,
            "ventas": ResponseCategory.SALES_RESPONSE,
            "general": ResponseCategory.GENERAL_INFO
        }
        
        return category_mapping.get(context.classification_category, ResponseCategory.GENERAL_INFO)
    
    def _determine_response_tone(self, context: ResponseContext) -> ResponseTone:
        """Determine appropriate response tone based on context"""
        content_lower = context.original_content.lower()
        
        # Check for technical content
        if any(keyword in content_lower for keyword in self.business_rules["technical_keywords"]):
            return ResponseTone.TECHNICAL
        
        # Check for formal language indicators
        formal_indicators = ["estimado", "distinguido", "cordialmente", "atentamente"]
        if any(indicator in content_lower for indicator in formal_indicators):
            return ResponseTone.FORMAL
        
        # Check for complaints or problems
        problem_indicators = ["problema", "error", "fallo", "no funciona", "molesto"]
        if any(indicator in content_lower for indicator in problem_indicators):
            return ResponseTone.APOLOGETIC
        
        # Default to friendly tone (matching system prompt)
        return ResponseTone.FRIENDLY
    
    def _extract_key_information(self, content: str) -> Dict[str, Any]:
        """Extract key information from email content"""
        info = {
            "topics": [],
            "urgency_level": "normal",
            "specific_request": None,
            "mentioned_products": [],
            "contact_preference": None
        }
        
        content_lower = content.lower()
        
        # Extract urgency level
        if any(keyword in content_lower for keyword in self.business_rules["escalation_keywords"]):
            info["urgency_level"] = "high"
        
        # Extract topics based on keywords
        if any(keyword in content_lower for keyword in self.business_rules["financial_keywords"]):
            info["topics"].append("financial")
        
        if any(keyword in content_lower for keyword in self.business_rules["technical_keywords"]):
            info["topics"].append("technical")
        
        # Extract contact preferences
        if "llamar" in content_lower or "teléfono" in content_lower:
            info["contact_preference"] = "phone"
        elif "email" in content_lower or "correo" in content_lower:
            info["contact_preference"] = "email"
        
        return info
    
    def _check_escalation_needs(self, context: ResponseContext) -> bool:
        """Check if response needs human escalation"""
        content_lower = context.original_content.lower()
        
        # Low classification confidence
        if context.classification_confidence < 0.6:
            return True
        
        # Escalation keywords present
        if any(keyword in content_lower for keyword in self.business_rules["escalation_keywords"]):
            return True
        
        # High-value customer indicators
        if any(indicator in content_lower for indicator in self.business_rules["high_value_indicators"]):
            return True
        
        return False
    
    def _generate_response_content(self, 
                                 context: ResponseContext, 
                                 category: ResponseCategory, 
                                 tone: ResponseTone,
                                 extracted_info: Dict[str, Any]) -> str:
        """Generate the actual response content"""
        
        # Get appropriate template
        category_key = context.classification_category
        tone_key = tone.value
        
        templates = self.response_templates.get(category_key, {})
        template = templates.get(tone_key)
        
        if not template:
            # Fallback to general friendly template
            template = self.response_templates["general"]["friendly"]
        
        # Extract sender name or use fallback
        sender_name = context.sender_name or "estimado/a cliente"
        
        # Determine topic for personalization
        topic = "tu consulta"
        if "financial" in extracted_info["topics"]:
            topic = "temas financieros"
        elif "technical" in extracted_info["topics"]:
            topic = "el problema técnico"
        
        # Build response
        response_parts = []
        
        # Greeting
        greeting = template["greeting"].format(sender_name=sender_name)
        response_parts.append(greeting)
        response_parts.append("")  # Empty line
        
        # Acknowledgment
        acknowledgment = template["acknowledgment"].format(
            sender_name=sender_name,
            topic=topic,
            ticket_number=f"TK{datetime.now().strftime('%Y%m%d%H%M')}"
        )
        response_parts.append(acknowledgment)
        response_parts.append("")
        
        # Action
        action = template["action"].format(topic=topic)
        response_parts.append(action)
        response_parts.append("")
        
        # Additional information
        if extracted_info["urgency_level"] == "high":
            response_parts.append("Dado el carácter urgente de tu consulta, la priorizaremos en nuestro sistema.")
            response_parts.append("")
        
        additional = template["additional"]
        response_parts.append(additional)
        response_parts.append("")
        
        # Closing
        closing = template["closing"]
        response_parts.append(closing)
        response_parts.append("")
        
        # Signature
        signature = template["signature"]
        response_parts.append(signature)
        
        return "\n".join(response_parts)
    
    def _generate_subject_line(self, context: ResponseContext, category: ResponseCategory) -> str:
        """Generate appropriate subject line"""
        original_subject = context.original_subject
        
        if not original_subject.lower().startswith('re:'):
            return f"Re: {original_subject}"
        
        return original_subject
    
    def _calculate_response_confidence(self, context: ResponseContext, extracted_info: Dict[str, Any]) -> float:
        """Calculate confidence level for the generated response"""
        base_confidence = context.classification_confidence
        
        # Adjust based on extracted information
        if extracted_info["topics"]:
            base_confidence += 0.1
        
        if extracted_info["urgency_level"] == "high":
            base_confidence -= 0.1  # Lower confidence for high urgency items
        
        # Ensure confidence is within valid range
        return max(0.0, min(1.0, base_confidence))
    
    def _generate_suggested_actions(self, context: ResponseContext, extracted_info: Dict[str, Any]) -> List[str]:
        """Generate suggested follow-up actions"""
        actions = []
        
        # Category-based actions
        if context.classification_category == "soporte_tecnico":
            actions.extend([
                "Crear ticket en sistema de soporte técnico",
                "Asignar a especialista técnico",
                "Solicitar información adicional si es necesario"
            ])
        elif context.classification_category == "finanzas":
            actions.extend([
                "Reenviar a departamento de finanzas",
                "Verificar estado de cuenta del cliente",
                "Preparar documentación relevante"
            ])
        elif context.classification_category == "ventas":
            actions.extend([
                "Reenviar a equipo comercial",
                "Preparar propuesta comercial",
                "Programar seguimiento comercial"
            ])
        
        # Urgency-based actions
        if extracted_info["urgency_level"] == "high":
            actions.insert(0, "PRIORIZAR: Marcar como urgente en el sistema")
        
        # Contact preference actions
        if extracted_info["contact_preference"] == "phone":
            actions.append("Contactar por teléfono según preferencia del cliente")
        
        return actions
    
    def customize_system_prompt(self, new_prompt: str):
        """Customize the system prompt for response generation"""
        self.system_prompt = new_prompt
        logger.info("System prompt updated")
    
    def get_response_statistics(self) -> Dict[str, Any]:
        """Get statistics about response generation (placeholder for real implementation)"""
        return {
            "total_responses_generated": 0,  # Would be tracked in real implementation
            "average_confidence": 0.0,
            "categories_distribution": {},
            "escalation_rate": 0.0,
            "templates_available": len(self.response_templates)
        }