#!/usr/bin/env python3
"""
Script para arreglar el esquema OpenAPI directamente en el servidor
"""

import os
import shutil

# Contenido de la función custom_openapi corregida
CUSTOM_OPENAPI_FUNCTION = '''# Custom OpenAPI schema generation
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    # Get paths from FastAPI
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Ensure OpenAPI version is set correctly
    openapi_schema["openapi"] = "3.0.2"
    
    # Add custom server information
    openapi_schema["servers"] = [
        {"url": "https://crm.arifamilyassets.com", "description": "Production server"},
        {"url": "http://localhost:8000", "description": "Development server"}
    ]
    
    # Ensure info section is complete
    if "info" not in openapi_schema:
        openapi_schema["info"] = {}
    
    openapi_schema["info"].update({
        "title": app.title,
        "version": app.version,
        "description": app.description,
        "contact": app.contact,
        "license": app.license_info,
    })
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi'''

def fix_main_py():
    """Fix the main.py file with correct OpenAPI schema generation"""
    main_py_path = "/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/main.py"
    backup_path = f"{main_py_path}.backup"
    
    # Create backup
    shutil.copy2(main_py_path, backup_path)
    print(f"✅ Backup created: {backup_path}")
    
    # Read current file
    with open(main_py_path, 'r') as f:
        content = f.read()
    
    # Find and replace the custom_openapi function
    start_marker = "# Custom OpenAPI schema generation"
    end_marker = "app.openapi = custom_openapi"
    
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("❌ Could not find custom_openapi function")
        return False
    
    # Find the end of the function
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        print("❌ Could not find end of custom_openapi function")
        return False
    
    end_idx += len(end_marker)
    
    # Replace the function
    new_content = content[:start_idx] + CUSTOM_OPENAPI_FUNCTION + content[end_idx:]
    
    # Write the fixed content
    with open(main_py_path, 'w') as f:
        f.write(new_content)
    
    print("✅ main.py fixed with correct OpenAPI schema generation")
    return True

if __name__ == "__main__":
    print("🔧 Fixing OpenAPI schema generation...")
    if fix_main_py():
        print("🎉 Fix applied successfully!")
        print("📝 Next steps:")
        print("   1. Rebuild the Docker container: ./update-backend.sh")
        print("   2. Test the docs: curl -u admin:crm2025@docs https://crm.arifamilyassets.com/docs")
    else:
        print("❌ Fix failed!")