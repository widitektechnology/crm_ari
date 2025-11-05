from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import imaplib
import smtplib
import ssl
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import json
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mail", tags=["mail"])

# Modelos para correo
class ServerSettings(BaseModel):
    server: str
    port: int
    ssl: bool
    username: str
    password: str

class MailAccountSettings(BaseModel):
    incoming: ServerSettings
    outgoing: ServerSettings

class TestConnectionRequest(BaseModel):
    incoming: ServerSettings
    outgoing: ServerSettings

class MailAccount(BaseModel):
    name: str
    email: EmailStr
    provider: str
    settings: MailAccountSettings
    isActive: bool = True
    isDefault: bool = False

class SendMessageRequest(BaseModel):
    accountId: str
    to: List[Dict[str, str]]
    subject: str
    body: Dict[str, str]  # {"text": "...", "html": "..."}
    cc: Optional[List[Dict[str, str]]] = []
    bcc: Optional[List[Dict[str, str]]] = []
    priority: str = "normal"
    requestReadReceipt: bool = False

# Utilidades para IMAP/SMTP
class MailConnectionManager:
    @staticmethod
    def test_imap_connection(settings: ServerSettings) -> Dict[str, Any]:
        try:
            if settings.ssl:
                mail = imaplib.IMAP4_SSL(settings.server, settings.port)
            else:
                mail = imaplib.IMAP4(settings.server, settings.port)
                if settings.port == 143:  # STARTTLS para puerto estándar
                    mail.starttls()
            
            mail.login(settings.username, settings.password)
            mail.select('INBOX')
            mail.close()
            mail.logout()
            
            return {
                "success": True,
                "message": "IMAP connection successful",
                "server": f"{settings.server}:{settings.port}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"IMAP Error: {str(e)}",
                "server": f"{settings.server}:{settings.port}"
            }
    
    @staticmethod
    def test_smtp_connection(settings: ServerSettings) -> Dict[str, Any]:
        try:
            if settings.ssl and settings.port == 465:
                server = smtplib.SMTP_SSL(settings.server, settings.port)
            else:
                server = smtplib.SMTP(settings.server, settings.port)
                if settings.ssl or settings.port == 587:
                    server.starttls()
            
            server.login(settings.username, settings.password)
            server.quit()
            
            return {
                "success": True,
                "message": "SMTP connection successful",
                "server": f"{settings.server}:{settings.port}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"SMTP Error: {str(e)}",
                "server": f"{settings.server}:{settings.port}"
            }
    
    @staticmethod
    def get_imap_folders(settings: ServerSettings) -> List[Dict[str, Any]]:
        try:
            if settings.ssl:
                mail = imaplib.IMAP4_SSL(settings.server, settings.port)
            else:
                mail = imaplib.IMAP4(settings.server, settings.port)
                if settings.port == 143:
                    mail.starttls()
            
            mail.login(settings.username, settings.password)
            
            # Obtener lista de carpetas
            result, folders = mail.list()
            folder_list = []
            
            for folder in folders:
                folder_info = folder.decode().split(' ')
                folder_name = folder_info[-1].strip('"')
                
                # Obtener conteo de mensajes
                try:
                    mail.select(folder_name)
                    result, messages = mail.search(None, 'ALL')
                    total_count = len(messages[0].split()) if messages[0] else 0
                    
                    result, unseen = mail.search(None, 'UNSEEN')
                    unread_count = len(unseen[0].split()) if unseen[0] else 0
                    
                    folder_list.append({
                        "id": folder_name.lower().replace(' ', '_'),
                        "name": folder_name,
                        "displayName": folder_name.replace('INBOX', 'Bandeja de entrada'),
                        "type": "inbox" if folder_name == "INBOX" else "folder",
                        "unreadCount": unread_count,
                        "totalCount": total_count,
                        "path": folder_name
                    })
                except:
                    continue
            
            mail.close()
            mail.logout()
            return folder_list
            
        except Exception as e:
            logger.error(f"Error getting folders: {str(e)}")
            return []

# Endpoints

@router.get("/health")
async def mail_health():
    return {
        "status": "ok",
        "service": "CRM ARI Mail API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/test-connection")
async def test_connection(request: TestConnectionRequest):
    """Probar conectividad IMAP y SMTP sin guardar la configuración"""
    
    imap_result = MailConnectionManager.test_imap_connection(request.incoming)
    smtp_result = MailConnectionManager.test_smtp_connection(request.outgoing)
    
    success = imap_result["success"] and smtp_result["success"]
    
    return {
        "success": success,
        "details": {
            "imap": imap_result["message"] if imap_result["success"] else imap_result["error"],
            "smtp": smtp_result["message"] if smtp_result["success"] else smtp_result["error"]
        },
        "errors": [] if success else [
            imap_result.get("error"),
            smtp_result.get("error")
        ]
    }

@router.post("/accounts")
async def create_account(account: MailAccount):
    """Registrar una nueva cuenta de correo"""
    
    # Verificar conectividad antes de guardar
    test_request = TestConnectionRequest(
        incoming=account.settings.incoming,
        outgoing=account.settings.outgoing
    )
    
    connection_test = await test_connection(test_request)
    if not connection_test["success"]:
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo conectar: {connection_test['details']}"
        )
    
    # Generar ID (en un sistema real se guardaría en BD)
    account_id = str(uuid.uuid4())
    
    return {
        "id": account_id,
        "message": "Cuenta registrada exitosamente",
        **account.dict()
    }

@router.get("/accounts")
async def get_accounts():
    """Obtener todas las cuentas registradas"""
    # En un sistema real se obtendría desde la base de datos
    return []

@router.get("/accounts/{account_id}/folders")
async def get_folders(account_id: str):
    """Sincronizar y obtener carpetas del servidor IMAP"""
    # En un sistema real se obtendría la configuración de la cuenta desde BD
    # Por ahora retornamos carpetas de ejemplo
    return [
        {
            "id": "inbox",
            "name": "INBOX",
            "displayName": "Bandeja de entrada",
            "type": "inbox",
            "unreadCount": 0,
            "totalCount": 0,
            "path": "INBOX"
        }
    ]

@router.get("/accounts/{account_id}/folders/{folder_id}/messages")
async def get_messages(account_id: str, folder_id: str, limit: int = 50, offset: int = 0):
    """Obtener mensajes de una carpeta específica"""
    
    return {
        "messages": [],
        "pagination": {
            "limit": limit,
            "offset": offset,
            "total": 0
        }
    }

@router.post("/send")
async def send_message(
    accountId: str = Form(...),
    to: str = Form(...),  # JSON string
    subject: str = Form(...),
    body: str = Form(...),  # JSON string
    cc: str = Form("[]"),
    bcc: str = Form("[]"),
    priority: str = Form("normal"),
    attachments: List[UploadFile] = File(default=[])
):
    """Enviar un mensaje usando SMTP"""
    
    try:
        # Parsear datos JSON
        to_list = json.loads(to)
        body_dict = json.loads(body)
        cc_list = json.loads(cc)
        bcc_list = json.loads(bcc)
        
        # En un sistema real se obtendría la configuración de la cuenta desde BD
        
        return {
            "success": True,
            "message": "Mensaje enviado exitosamente (simulado)",
            "messageId": f"<{uuid.uuid4()}@crm.local>",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error enviando mensaje: {str(e)}")

@router.delete("/accounts/{account_id}")
async def delete_account(account_id: str):
    """Eliminar una cuenta"""
    return {"success": True, "message": "Cuenta eliminada (simulado)"}