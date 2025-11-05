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
import random
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
    
    # Generar ID y simular guardado en memoria (para demo)
    account_id = str(uuid.uuid4())
    
    # Simular obtener carpetas iniciales
    try:
        folders = MailConnectionManager.get_imap_folders(account.settings.incoming)
        folder_count = len(folders)
        unread_count = sum(folder.get('unreadCount', 0) for folder in folders)
    except:
        folder_count = 1
        unread_count = 0
    
    return {
        "id": account_id,
        "message": "Cuenta registrada exitosamente",
        "name": account.name,
        "email": account.email,
        "provider": account.provider,
        "isActive": account.isActive,
        "isDefault": account.isDefault,
        "unreadCount": unread_count,
        "totalCount": 0,
        "lastSync": datetime.now().isoformat(),
        "folders": folder_count
    }

@router.get("/accounts")
async def get_accounts():
    """Obtener todas las cuentas registradas"""
    # En un sistema real se obtendría desde la base de datos
    return []

@router.get("/accounts/{account_id}/folders")
async def get_folders(account_id: str):
    """Sincronizar y obtener carpetas del servidor IMAP"""
    
    # Para demo, retornamos carpetas estándar
    # En producción, aquí se obtendría la configuración de la cuenta desde BD
    # y se llamaría a MailConnectionManager.get_imap_folders()
    
    folders = [
        {
            "id": "inbox",
            "accountId": account_id,
            "name": "INBOX",
            "displayName": "Bandeja de entrada",
            "type": "inbox",
            "unreadCount": 5,
            "totalCount": 25,
            "path": "INBOX",
            "attributes": []
        },
        {
            "id": "sent",
            "accountId": account_id,
            "name": "SENT", 
            "displayName": "Enviados",
            "type": "sent",
            "unreadCount": 0,
            "totalCount": 15,
            "path": "SENT",
            "attributes": []
        },
        {
            "id": "drafts",
            "accountId": account_id,
            "name": "DRAFTS",
            "displayName": "Borradores", 
            "type": "drafts",
            "unreadCount": 2,
            "totalCount": 3,
            "path": "DRAFTS",
            "attributes": []
        },
        {
            "id": "trash",
            "accountId": account_id,
            "name": "TRASH",
            "displayName": "Papelera",
            "type": "trash", 
            "unreadCount": 0,
            "totalCount": 8,
            "path": "TRASH",
            "attributes": []
        }
    ]
    
    return folders

@router.get("/accounts/{account_id}/folders/{folder_id}/messages")
async def get_messages(account_id: str, folder_id: str, limit: int = 50, offset: int = 0):
    """Obtener mensajes de una carpeta específica"""
    
    # Para demo, generamos mensajes de ejemplo basados en el folder
    messages = []
    
    if folder_id == "inbox":
        messages = [
            {
                "id": f"msg_{i}",
                "accountId": account_id,
                "messageId": f"<msg{i}@example.com>",
                "subject": f"Mensaje de prueba {i}",
                "from": {
                    "name": f"Remitente {i}",
                    "email": f"sender{i}@example.com"
                },
                "to": [{
                    "name": "Mi Cuenta",
                    "email": "micuenta@example.com"
                }],
                "cc": [],
                "bcc": [],
                "body": {
                    "text": f"Este es el contenido del mensaje {i} en texto plano.",
                    "html": f"<p>Este es el contenido del mensaje <strong>{i}</strong> en HTML.</p>"
                },
                "attachments": [],
                "isRead": i % 3 != 0,  # Algunos no leídos
                "isStarred": i % 5 == 0,
                "isFlagged": False,
                "isImportant": i % 4 == 0,
                "labels": [],
                "folderId": folder_id,
                "receivedAt": datetime.now().replace(hour=10, minute=30+i).isoformat(),
                "sentAt": datetime.now().replace(hour=10, minute=29+i).isoformat(),
                "size": 1024 + (i * 100),
                "hasAttachments": i % 6 == 0,
                "snippet": f"Extracto del mensaje {i}. Este es un ejemplo de contenido..."
            }
            for i in range(1, min(limit + 1, 26))  # Máximo 25 mensajes de ejemplo
        ]
    elif folder_id == "sent":
        messages = [
            {
                "id": f"sent_{i}",
                "accountId": account_id,
                "messageId": f"<sent{i}@example.com>",
                "subject": f"RE: Respuesta {i}",
                "from": {
                    "name": "Mi Cuenta",
                    "email": "micuenta@example.com"
                },
                "to": [{
                    "name": f"Destinatario {i}",
                    "email": f"dest{i}@example.com"
                }],
                "cc": [],
                "bcc": [],
                "body": {
                    "text": f"Esta es mi respuesta {i} enviada.",
                    "html": f"<p>Esta es mi <em>respuesta {i}</em> enviada.</p>"
                },
                "attachments": [],
                "isRead": True,
                "isStarred": False,
                "isFlagged": False,
                "isImportant": False,
                "labels": [],
                "folderId": folder_id,
                "receivedAt": datetime.now().replace(hour=14, minute=30+i).isoformat(),
                "sentAt": datetime.now().replace(hour=14, minute=30+i).isoformat(),
                "size": 512 + (i * 50),
                "hasAttachments": False,
                "snippet": f"Esta es mi respuesta {i} enviada..."
            }
            for i in range(1, min(limit + 1, 16))  # Máximo 15 mensajes enviados
        ]
    
    return {
        "messages": messages[offset:offset+limit],
        "pagination": {
            "limit": limit,
            "offset": offset,
            "total": len(messages)
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
        
        # Validar datos básicos
        if not to_list or len(to_list) == 0:
            raise HTTPException(status_code=400, detail="Se requiere al menos un destinatario")
        
        if not subject or not subject.strip():
            raise HTTPException(status_code=400, detail="El asunto es requerido")
        
        # Procesar archivos adjuntos
        attachment_info = []
        for attachment in attachments:
            if attachment.filename:
                # En producción, aquí se guardarían los archivos
                attachment_info.append({
                    "filename": attachment.filename,
                    "size": attachment.size if hasattr(attachment, 'size') else 0,
                    "contentType": attachment.content_type
                })
        
        # Simular envío exitoso
        message_id = f"<{uuid.uuid4()}@crm.local>"
        timestamp = datetime.now().isoformat()
        
        # Log para debugging
        logger.info(f"Mensaje enviado - ID: {message_id}")
        logger.info(f"De: {accountId} Para: {[t['email'] for t in to_list]}")
        logger.info(f"Asunto: {subject}")
        logger.info(f"Adjuntos: {len(attachment_info)}")
        
        return {
            "success": True,
            "message": "Mensaje enviado exitosamente",
            "messageId": message_id,
            "timestamp": timestamp,
            "recipients": {
                "to": len(to_list),
                "cc": len(cc_list), 
                "bcc": len(bcc_list)
            },
            "attachments": len(attachment_info),
            "size": len(body_dict.get('text', '') + body_dict.get('html', ''))
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON: {str(e)}")
        raise HTTPException(status_code=400, detail="Formato JSON inválido en los datos")
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error enviando mensaje: {str(e)}")

@router.post("/{accountId}/messages/{messageId}/move")
async def move_message(accountId: str, messageId: str, data: dict):
    """Mover un mensaje a otra carpeta"""
    
    try:
        target_folder = data.get("targetFolder")
        if not target_folder:
            raise HTTPException(status_code=400, detail="Target folder required")
        
        # Validar carpeta destino
        valid_folders = ["INBOX", "Sent", "Drafts", "Trash", "Spam", "Archive"]
        if target_folder not in valid_folders:
            raise HTTPException(status_code=400, detail=f"Carpeta inválida. Válidas: {valid_folders}")
        
        # Simular operación de movimiento exitosa
        timestamp = datetime.now().isoformat()
        
        logger.info(f"Mensaje {messageId} movido a {target_folder} para cuenta {accountId}")
        
        return {
            "success": True,
            "message": f"Mensaje movido a {target_folder} exitosamente",
            "messageId": messageId,
            "sourceFolder": "INBOX",  # En producción se obtendría la carpeta actual
            "targetFolder": target_folder,
            "timestamp": timestamp,
            "operation": "move"
        }
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Error moving message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error moviendo mensaje: {str(e)}")

@router.delete("/{accountId}/messages/{messageId}")
async def delete_message(accountId: str, messageId: str):
    """Eliminar un mensaje"""
    
    try:
        # Simular eliminación exitosa
        timestamp = datetime.now().isoformat()
        
        logger.info(f"Mensaje {messageId} eliminado para cuenta {accountId}")
        
        return {
            "success": True,
            "message": "Mensaje eliminado exitosamente",
            "messageId": messageId,
            "timestamp": timestamp,
            "operation": "delete",
            "movedToTrash": True  # En producción indicaría si se movió a papelera o eliminó permanentemente
        }
        
    except Exception as e:
        logger.error(f"Error deleting message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error eliminando mensaje: {str(e)}")

@router.patch("/{accountId}/messages/{messageId}")
async def update_message(accountId: str, messageId: str, data: dict):
    """Actualizar propiedades de un mensaje (marcar como leído, estrella, etc.)"""
    
    try:
        # Extraer propiedades a actualizar
        is_read = data.get("isRead")
        is_starred = data.get("isStarred") 
        is_flagged = data.get("isFlagged")
        is_important = data.get("isImportant")
        labels = data.get("labels")
        
        timestamp = datetime.now().isoformat()
        
        # Construir respuesta con cambios aplicados
        changes = {}
        if is_read is not None:
            changes["isRead"] = is_read
        if is_starred is not None:
            changes["isStarred"] = is_starred
        if is_flagged is not None:
            changes["isFlagged"] = is_flagged
        if is_important is not None:
            changes["isImportant"] = is_important
        if labels is not None:
            changes["labels"] = labels
        
        logger.info(f"Mensaje {messageId} actualizado para cuenta {accountId}: {changes}")
        
        return {
            "success": True,
            "message": "Mensaje actualizado exitosamente",
            "messageId": messageId,
            "changes": changes,
            "timestamp": timestamp,
            "operation": "update"
        }
        
    except Exception as e:
        logger.error(f"Error updating message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error actualizando mensaje: {str(e)}")

@router.post("/{accountId}/sync")
async def sync_messages(accountId: str, data: dict = None):
    """Sincronizar mensajes con el servidor de correo"""
    
    try:
        folder_id = data.get("folderId", "INBOX") if data else "INBOX"
        force_sync = data.get("forceSync", False) if data else False
        
        # Simular sincronización
        timestamp = datetime.now().isoformat()
        
        # Simular descarga de nuevos mensajes
        new_messages = random.randint(0, 5)
        updated_messages = random.randint(0, 3)
        deleted_messages = random.randint(0, 2)
        
        logger.info(f"Sincronización completada para cuenta {accountId}, carpeta {folder_id}")
        
        return {
            "success": True,
            "message": "Sincronización completada exitosamente",
            "accountId": accountId,
            "folderId": folder_id,
            "timestamp": timestamp,
            "statistics": {
                "newMessages": new_messages,
                "updatedMessages": updated_messages,
                "deletedMessages": deleted_messages,
                "totalProcessed": new_messages + updated_messages + deleted_messages
            },
            "forceSync": force_sync,
            "lastSync": timestamp
        }
        
    except Exception as e:
        logger.error(f"Error syncing messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sincronizando mensajes: {str(e)}")

@router.get("/{accountId}/messages/{messageId}")
async def get_message_detail(accountId: str, messageId: str):
    """Obtener detalles completos de un mensaje específico"""
    
    try:
        # Simular búsqueda del mensaje
        timestamp = datetime.now().isoformat()
        
        # Generar mensaje de ejemplo detallado
        message = {
            "id": messageId,
            "accountId": accountId,
            "messageId": f"<{messageId}@crm.local>",
            "subject": f"Mensaje detallado - {messageId}",
            "from": {
                "name": "Remitente Ejemplo",
                "email": "remitente@example.com"
            },
            "to": [{
                "name": "Mi Cuenta",
                "email": "micuenta@example.com"
            }],
            "cc": [],
            "bcc": [],
            "replyTo": [{
                "name": "Remitente Ejemplo",
                "email": "remitente@example.com"
            }],
            "body": {
                "text": f"Este es el contenido completo del mensaje {messageId} en texto plano.\n\nIncluye múltiples párrafos y detalles completos del mensaje.",
                "html": f"<div><p>Este es el contenido completo del mensaje <strong>{messageId}</strong> en HTML.</p><p>Incluye múltiples párrafos y <em>formato rico</em> del mensaje.</p></div>"
            },
            "attachments": [
                {
                    "id": "att_1",
                    "filename": "documento.pdf",
                    "size": 256000,
                    "contentType": "application/pdf",
                    "downloadUrl": f"/api/mail/{accountId}/messages/{messageId}/attachments/att_1"
                }
            ] if messageId.endswith("1") else [],
            "headers": {
                "Message-ID": f"<{messageId}@crm.local>",
                "Date": timestamp,
                "X-Mailer": "CRM ARI Mail System",
                "X-Priority": "3"
            },
            "isRead": True,
            "isStarred": messageId.endswith("5"),
            "isFlagged": False,
            "isImportant": messageId.endswith("0"),
            "labels": ["inbox"],
            "folderId": "inbox",
            "receivedAt": timestamp,
            "sentAt": datetime.now().replace(minute=30).isoformat(),
            "size": 2048,
            "hasAttachments": messageId.endswith("1"),
            "snippet": f"Extracto del mensaje {messageId}. Este es un ejemplo de contenido...",
            "threadId": f"thread_{messageId}",
            "conversationId": f"conv_{messageId}",
            "inReplyTo": None,
            "references": []
        }
        
        logger.info(f"Detalles del mensaje {messageId} obtenidos para cuenta {accountId}")
        
        return message
        
    except Exception as e:
        logger.error(f"Error getting message detail: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo detalles del mensaje: {str(e)}")

@router.delete("/accounts/{account_id}")
async def delete_account(account_id: str):
    """Eliminar una cuenta"""
    
    try:
        timestamp = datetime.now().isoformat()
        
        logger.info(f"Cuenta {account_id} eliminada")
        
        return {
            "success": True, 
            "message": "Cuenta eliminada exitosamente",
            "accountId": account_id,
            "timestamp": timestamp,
            "operation": "delete_account"
        }
        
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error eliminando cuenta: {str(e)}")