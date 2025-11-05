from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
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
import sqlite3
import uuid
from datetime import datetime
import logging
import os
from io import BytesIO

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CRM ARI Mail API", version="1.0.0")

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
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

# Inicializar base de datos SQLite
def init_database():
    conn = sqlite3.connect('mail_accounts.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            provider TEXT NOT NULL,
            settings TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            is_default BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_sync TIMESTAMP,
            unread_count INTEGER DEFAULT 0,
            total_count INTEGER DEFAULT 0
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            folder_id TEXT NOT NULL,
            subject TEXT,
            sender TEXT,
            recipients TEXT,
            body_text TEXT,
            body_html TEXT,
            attachments TEXT,
            is_read BOOLEAN DEFAULT 0,
            is_starred BOOLEAN DEFAULT 0,
            received_at TIMESTAMP,
            sent_at TIMESTAMP,
            size INTEGER,
            FOREIGN KEY (account_id) REFERENCES accounts (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Inicializar DB al arrancar
init_database()

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
    
    @staticmethod
    def get_messages(settings: ServerSettings, folder: str = "INBOX", limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        try:
            if settings.ssl:
                mail = imaplib.IMAP4_SSL(settings.server, settings.port)
            else:
                mail = imaplib.IMAP4(settings.server, settings.port)
                if settings.port == 143:
                    mail.starttls()
            
            mail.login(settings.username, settings.password)
            mail.select(folder)
            
            # Buscar todos los mensajes
            result, messages = mail.search(None, 'ALL')
            message_ids = messages[0].split()
            
            # Aplicar paginación
            total_messages = len(message_ids)
            start_idx = max(0, total_messages - offset - limit)
            end_idx = total_messages - offset
            
            selected_ids = message_ids[start_idx:end_idx]
            selected_ids.reverse()  # Más recientes primero
            
            message_list = []
            
            for msg_id in selected_ids:
                try:
                    result, msg_data = mail.fetch(msg_id, '(RFC822.HEADER)')
                    if result == 'OK':
                        email_message = email.message_from_bytes(msg_data[0][1])
                        
                        # Parsear información básica
                        message_info = {
                            "id": f"msg_{msg_id.decode()}",
                            "messageId": email_message.get('Message-ID', ''),
                            "subject": email_message.get('Subject', 'Sin asunto'),
                            "from": {
                                "name": email_message.get('From', ''),
                                "email": email_message.get('From', '')
                            },
                            "to": [{
                                "name": email_message.get('To', ''),
                                "email": email_message.get('To', '')
                            }],
                            "receivedAt": email_message.get('Date', ''),
                            "isRead": False,  # TODO: Implementar flags
                            "isStarred": False,
                            "hasAttachments": False,
                            "snippet": "Mensaje de muestra...",
                            "size": len(str(email_message))
                        }
                        
                        message_list.append(message_info)
                        
                except Exception as e:
                    logger.error(f"Error processing message {msg_id}: {str(e)}")
                    continue
            
            mail.close()
            mail.logout()
            return message_list
            
        except Exception as e:
            logger.error(f"Error getting messages: {str(e)}")
            return []

# Endpoints

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "CRM ARI Mail API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/mail/test-connection")
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

@app.post("/api/mail/accounts")
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
    
    # Generar ID y guardar en DB
    account_id = str(uuid.uuid4())
    
    conn = sqlite3.connect('mail_accounts.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO accounts (id, name, email, provider, settings, is_active, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            account_id,
            account.name,
            account.email,
            account.provider,
            json.dumps(account.settings.dict()),
            account.isActive,
            account.isDefault
        ))
        
        conn.commit()
        
        return {
            "id": account_id,
            "message": "Cuenta registrada exitosamente",
            **account.dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando cuenta: {str(e)}")
    finally:
        conn.close()

@app.get("/api/mail/accounts")
async def get_accounts():
    """Obtener todas las cuentas registradas"""
    
    conn = sqlite3.connect('mail_accounts.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT id, name, email, provider, settings, is_active, is_default,
                   created_at, last_sync, unread_count, total_count
            FROM accounts WHERE is_active = 1
        ''')
        
        accounts = []
        for row in cursor.fetchall():
            settings = json.loads(row[4])
            accounts.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "provider": row[3],
                "settings": settings,
                "isActive": bool(row[5]),
                "isDefault": bool(row[6]),
                "created_at": row[7],
                "lastSync": row[8],
                "unreadCount": row[9] or 0,
                "totalCount": row[10] or 0
            })
        
        return accounts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo cuentas: {str(e)}")
    finally:
        conn.close()

@app.get("/api/mail/accounts/{account_id}/folders")
async def get_folders(account_id: str):
    """Sincronizar y obtener carpetas del servidor IMAP"""
    
    # Obtener configuración de la cuenta
    conn = sqlite3.connect('mail_accounts.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT settings FROM accounts WHERE id = ?', (account_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Cuenta no encontrada")
        
        settings_dict = json.loads(row[0])
        incoming_settings = ServerSettings(**settings_dict['incoming'])
        
        folders = MailConnectionManager.get_imap_folders(incoming_settings)
        return folders
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo carpetas: {str(e)}")
    finally:
        conn.close()

@app.get("/api/mail/accounts/{account_id}/folders/{folder_id}/messages")
async def get_messages(account_id: str, folder_id: str, limit: int = 50, offset: int = 0):
    """Obtener mensajes de una carpeta específica"""
    
    # Obtener configuración de la cuenta
    conn = sqlite3.connect('mail_accounts.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT settings FROM accounts WHERE id = ?', (account_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Cuenta no encontrada")
        
        settings_dict = json.loads(row[0])
        incoming_settings = ServerSettings(**settings_dict['incoming'])
        
        # Convertir folder_id a nombre real de carpeta
        folder_name = folder_id.upper() if folder_id == 'inbox' else folder_id
        
        messages = MailConnectionManager.get_messages(
            incoming_settings, 
            folder_name, 
            limit, 
            offset
        )
        
        return {
            "messages": messages,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": len(messages)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo mensajes: {str(e)}")
    finally:
        conn.close()

@app.post("/api/mail/send")
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
        
        # Obtener configuración de la cuenta
        conn = sqlite3.connect('mail_accounts.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT settings, email FROM accounts WHERE id = ?', (accountId,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Cuenta no encontrada")
        
        settings_dict = json.loads(row[0])
        from_email = row[1]
        outgoing_settings = ServerSettings(**settings_dict['outgoing'])
        
        # Crear mensaje
        msg = MIMEMultipart('alternative')
        msg['From'] = from_email
        msg['To'] = ', '.join([recipient['email'] for recipient in to_list])
        msg['Subject'] = subject
        
        if cc_list:
            msg['Cc'] = ', '.join([recipient['email'] for recipient in cc_list])
        
        # Agregar cuerpo del mensaje
        if body_dict.get('text'):
            text_part = MIMEText(body_dict['text'], 'plain', 'utf-8')
            msg.attach(text_part)
        
        if body_dict.get('html'):
            html_part = MIMEText(body_dict['html'], 'html', 'utf-8')
            msg.attach(html_part)
        
        # Agregar archivos adjuntos
        for attachment in attachments:
            if attachment.filename:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(await attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {attachment.filename}'
                )
                msg.attach(part)
        
        # Enviar mensaje
        if outgoing_settings.ssl and outgoing_settings.port == 465:
            server = smtplib.SMTP_SSL(outgoing_settings.server, outgoing_settings.port)
        else:
            server = smtplib.SMTP(outgoing_settings.server, outgoing_settings.port)
            if outgoing_settings.ssl or outgoing_settings.port == 587:
                server.starttls()
        
        server.login(outgoing_settings.username, outgoing_settings.password)
        
        # Lista completa de destinatarios
        all_recipients = [r['email'] for r in to_list + cc_list + bcc_list]
        
        server.send_message(msg, to_addrs=all_recipients)
        server.quit()
        
        return {
            "success": True,
            "message": "Mensaje enviado exitosamente",
            "messageId": msg['Message-ID'],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error enviando mensaje: {str(e)}")
    finally:
        conn.close()

@app.delete("/api/mail/accounts/{account_id}")
async def delete_account(account_id: str):
    """Eliminar una cuenta"""
    
    conn = sqlite3.connect('mail_accounts.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM accounts WHERE id = ?', (account_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cuenta no encontrada")
        
        conn.commit()
        return {"success": True, "message": "Cuenta eliminada"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error eliminando cuenta: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)