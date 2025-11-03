"""
HTTP Request Client - Configurable API Integration
Robust HTTP client with authentication, error handling, and retry strategies
"""
import asyncio
import json
import logging
from typing import Dict, Any, Optional, Union, List
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import httpx
from httpx import Response
import backoff

logger = logging.getLogger(__name__)


class HttpMethod(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class AuthenticationType(Enum):
    NONE = "none"
    BEARER_TOKEN = "bearer_token"
    BASIC_AUTH = "basic_auth"
    API_KEY = "api_key"
    OAUTH2 = "oauth2"


@dataclass
class AuthenticationConfig:
    """Authentication configuration for API requests"""
    auth_type: AuthenticationType = AuthenticationType.NONE
    token: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    api_key: Optional[str] = None
    api_key_header: str = "X-API-Key"
    oauth2_token: Optional[str] = None
    
    def get_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        headers = {}
        
        if self.auth_type == AuthenticationType.BEARER_TOKEN and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        elif self.auth_type == AuthenticationType.API_KEY and self.api_key:
            headers[self.api_key_header] = self.api_key
        elif self.auth_type == AuthenticationType.OAUTH2 and self.oauth2_token:
            headers["Authorization"] = f"Bearer {self.oauth2_token}"
        
        return headers
    
    def get_auth(self) -> Optional[tuple]:
        """Get basic auth tuple if applicable"""
        if self.auth_type == AuthenticationType.BASIC_AUTH:
            return (self.username, self.password)
        return None


@dataclass
class RetryConfig:
    """Retry configuration for failed requests"""
    max_retries: int = 3
    backoff_factor: float = 1.0
    retry_statuses: List[int] = field(default_factory=lambda: [429, 500, 502, 503, 504])
    no_retry_statuses: List[int] = field(default_factory=lambda: [400, 401, 403, 404])
    
    def should_retry(self, status_code: int) -> bool:
        """Determine if request should be retried based on status code"""
        if status_code in self.no_retry_statuses:
            return False
        return status_code in self.retry_statuses


@dataclass
class HttpRequestConfig:
    """Complete HTTP request configuration"""
    method: HttpMethod
    url: str
    headers: Optional[Dict[str, str]] = None
    body: Optional[Union[str, Dict[str, Any]]] = None
    params: Optional[Dict[str, str]] = None
    timeout: int = 30
    authentication: Optional[AuthenticationConfig] = None
    retry_config: Optional[RetryConfig] = None
    variables: Optional[Dict[str, Any]] = None  # For dynamic variable substitution
    
    def __post_init__(self):
        if self.retry_config is None:
            self.retry_config = RetryConfig()
        if self.authentication is None:
            self.authentication = AuthenticationConfig()


class HttpRequestClient:
    """
    Configurable HTTP client for external API integration
    Supports authentication, retries, error handling, and dynamic variables
    """
    
    def __init__(self):
        self.client = httpx.AsyncClient()
    
    async def execute_request(self, config: HttpRequestConfig) -> Dict[str, Any]:
        """Execute HTTP request with full configuration"""
        try:
            # Apply variable substitutions
            processed_config = self._apply_variables(config)
            
            # Execute request with retry logic
            response = await self._execute_with_retry(processed_config)
            
            # Process response
            result = await self._process_response(response, processed_config)
            
            logger.info(f"HTTP request successful: {config.method.value} {config.url}")
            return result
            
        except Exception as e:
            logger.error(f"HTTP request failed: {config.method.value} {config.url} - {str(e)}")
            raise
    
    def _apply_variables(self, config: HttpRequestConfig) -> HttpRequestConfig:
        """Apply dynamic variables to request configuration"""
        if not config.variables:
            return config
        
        # Create a copy to avoid modifying original
        processed_config = HttpRequestConfig(
            method=config.method,
            url=self._substitute_variables(config.url, config.variables),
            headers=self._substitute_dict_variables(config.headers, config.variables),
            body=self._substitute_body_variables(config.body, config.variables),
            params=self._substitute_dict_variables(config.params, config.variables),
            timeout=config.timeout,
            authentication=config.authentication,
            retry_config=config.retry_config
        )
        
        return processed_config
    
    def _substitute_variables(self, text: Optional[str], variables: Dict[str, Any]) -> Optional[str]:
        """Substitute variables in text using {variable_name} format"""
        if not text or not variables:
            return text
        
        try:
            return text.format(**variables)
        except KeyError as e:
            logger.warning(f"Variable substitution failed: {str(e)}")
            return text
    
    def _substitute_dict_variables(self, 
                                 data: Optional[Dict[str, str]], 
                                 variables: Dict[str, Any]) -> Optional[Dict[str, str]]:
        """Substitute variables in dictionary values"""
        if not data or not variables:
            return data
        
        result = {}
        for key, value in data.items():
            result[key] = self._substitute_variables(value, variables)
        
        return result
    
    def _substitute_body_variables(self, 
                                 body: Optional[Union[str, Dict[str, Any]]], 
                                 variables: Dict[str, Any]) -> Optional[Union[str, Dict[str, Any]]]:
        """Substitute variables in request body"""
        if not body or not variables:
            return body
        
        if isinstance(body, str):
            return self._substitute_variables(body, variables)
        elif isinstance(body, dict):
            return self._substitute_dict_in_dict(body, variables)
        
        return body
    
    def _substitute_dict_in_dict(self, data: Dict[str, Any], variables: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively substitute variables in nested dictionary"""
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = self._substitute_variables(value, variables)
            elif isinstance(value, dict):
                result[key] = self._substitute_dict_in_dict(value, variables)
            elif isinstance(value, list):
                result[key] = [
                    self._substitute_variables(item, variables) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                result[key] = value
        
        return result
    
    async def _execute_with_retry(self, config: HttpRequestConfig) -> Response:
        """Execute request with retry logic"""
        
        @backoff.on_exception(
            backoff.constant,
            (httpx.RequestError, httpx.HTTPStatusError),
            max_tries=config.retry_config.max_retries + 1,
            interval=config.retry_config.backoff_factor,
            giveup=lambda e: self._should_not_retry(e, config.retry_config)
        )
        async def _make_request():
            # Prepare headers
            headers = config.headers or {}
            auth_headers = config.authentication.get_headers()
            headers.update(auth_headers)
            
            # Prepare body
            body_data = None
            if config.body:
                if isinstance(config.body, dict):
                    body_data = json.dumps(config.body)
                    headers["Content-Type"] = "application/json"
                else:
                    body_data = config.body
            
            # Get authentication
            auth = config.authentication.get_auth()
            
            # Make request
            response = await self.client.request(
                method=config.method.value,
                url=config.url,
                headers=headers,
                content=body_data,
                params=config.params,
                auth=auth,
                timeout=config.timeout
            )
            
            # Check for HTTP errors
            if response.status_code >= 400:
                if not config.retry_config.should_retry(response.status_code):
                    raise httpx.HTTPStatusError(
                        message=f"HTTP {response.status_code}",
                        request=response.request,
                        response=response
                    )
                else:
                    # Raise retryable error
                    raise httpx.RequestError(f"HTTP {response.status_code} - Retryable error")
            
            return response
        
        return await _make_request()
    
    def _should_not_retry(self, exception: Exception, retry_config: RetryConfig) -> bool:
        """Determine if exception should not be retried"""
        if isinstance(exception, httpx.HTTPStatusError):
            return not retry_config.should_retry(exception.response.status_code)
        return False
    
    async def _process_response(self, response: Response, config: HttpRequestConfig) -> Dict[str, Any]:
        """Process HTTP response and extract data"""
        result = {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "url": str(response.url),
            "method": config.method.value,
            "timestamp": datetime.now().isoformat(),
            "success": response.status_code < 400
        }
        
        # Try to parse JSON response
        try:
            if response.headers.get("content-type", "").startswith("application/json"):
                result["data"] = response.json()
            else:
                result["data"] = response.text
        except Exception as e:
            logger.warning(f"Failed to parse response: {str(e)}")
            result["data"] = response.text
        
        # Add response size
        result["response_size"] = len(response.content)
        
        return result
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


class ApiIntegrationService:
    """
    High-level service for API integrations
    Manages HTTP requests with business logic integration
    """
    
    def __init__(self):
        self.http_client = HttpRequestClient()
        self.integration_configs: Dict[str, HttpRequestConfig] = {}
    
    def register_integration(self, name: str, config: HttpRequestConfig):
        """Register a named API integration configuration"""
        self.integration_configs[name] = config
        logger.info(f"Registered API integration: {name}")
    
    async def execute_integration(self, 
                                name: str, 
                                variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a registered API integration"""
        if name not in self.integration_configs:
            raise ValueError(f"Integration '{name}' not found")
        
        config = self.integration_configs[name]
        
        # Apply variables if provided
        if variables:
            config.variables = {**(config.variables or {}), **variables}
        
        return await self.http_client.execute_request(config)
    
    async def execute_custom_request(self, config: HttpRequestConfig) -> Dict[str, Any]:
        """Execute a custom HTTP request"""
        return await self.http_client.execute_request(config)
    
    async def test_integration(self, name: str) -> Dict[str, Any]:
        """Test a registered API integration"""
        try:
            result = await self.execute_integration(name)
            return {
                "integration_name": name,
                "test_successful": result["success"],
                "status_code": result["status_code"],
                "response_time": "N/A",  # Would need timing implementation
                "test_timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "integration_name": name,
                "test_successful": False,
                "error": str(e),
                "test_timestamp": datetime.now().isoformat()
            }
    
    async def close(self):
        """Close the service and underlying HTTP client"""
        await self.http_client.close()


# Example integration configurations
def create_example_integrations() -> Dict[str, HttpRequestConfig]:
    """Create example API integration configurations"""
    
    # Example: CRM API integration
    crm_config = HttpRequestConfig(
        method=HttpMethod.GET,
        url="https://api.crm-system.com/contacts/{contact_id}",
        headers={
            "Accept": "application/json",
            "User-Agent": "ERP-System/1.0"
        },
        authentication=AuthenticationConfig(
            auth_type=AuthenticationType.BEARER_TOKEN,
            token="your-api-token-here"
        ),
        retry_config=RetryConfig(
            max_retries=3,
            backoff_factor=2.0
        )
    )
    
    # Example: Payment gateway integration
    payment_config = HttpRequestConfig(
        method=HttpMethod.POST,
        url="https://api.payment-gateway.com/charges",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body={
            "amount": "{amount}",
            "currency": "{currency}",
            "customer_id": "{customer_id}",
            "description": "Invoice payment"
        },
        authentication=AuthenticationConfig(
            auth_type=AuthenticationType.API_KEY,
            api_key="your-payment-api-key",
            api_key_header="X-Payment-Key"
        ),
        retry_config=RetryConfig(
            max_retries=2,
            no_retry_statuses=[400, 401, 402, 403, 404, 422]
        )
    )
    
    # Example: Email service integration
    email_config = HttpRequestConfig(
        method=HttpMethod.POST,
        url="https://api.email-service.com/send",
        headers={
            "Content-Type": "application/json"
        },
        body={
            "to": "{recipient_email}",
            "subject": "{subject}",
            "html": "{html_content}",
            "from": "noreply@yourcompany.com"
        },
        authentication=AuthenticationConfig(
            auth_type=AuthenticationType.API_KEY,
            api_key="your-email-api-key",
            api_key_header="Authorization"
        )
    )
    
    return {
        "crm_contact_fetch": crm_config,
        "payment_charge": payment_config,
        "email_send": email_config
    }