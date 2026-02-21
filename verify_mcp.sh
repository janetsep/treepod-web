#!/bin/bash

# Script de verificación MCP para TreePod
# Ejecutar después de reiniciar Antigravity/Claude Desktop

echo "🔍 Verificando instalación de MCPs..."
echo ""

# Verificar pipx packages
echo "📦 Paquetes instalados con pipx:"
pipx list | grep -E "(google-ads-mcp|mcp)"
echo ""

# Verificar que google-ads-mcp esté en PATH
echo "🔍 Verificando google-ads-mcp en PATH:"
which google-ads-mcp
if [ $? -eq 0 ]; then
    echo "✅ google-ads-mcp encontrado"
else
    echo "❌ google-ads-mcp NO encontrado en PATH"
fi
echo ""

# Verificar credenciales
echo "🔐 Verificando credenciales de Google:"
if [ -f "/Users/janetsepulvedacorrea/treepod-web/google_credentials.json" ]; then
    echo "✅ google_credentials.json existe"
    cat /Users/janetsepulvedacorrea/treepod-web/google_credentials.json | python3 -c "import sys, json; data=json.load(sys.stdin); print('   Project ID:', data.get('project_id')); print('   Service Account:', data.get('client_email'))"
else
    echo "❌ google_credentials.json NO encontrado"
fi
echo ""

# Verificar archivo de configuración MCP
echo "⚙️  Verificando configuración MCP:"
if [ -f "/Users/janetsepulvedacorrea/.gemini/antigravity/mcp_config.json" ]; then
    echo "✅ mcp_config.json existe"
    echo "   Servidores configurados:"
    cat /Users/janetsepulvedacorrea/.gemini/antigravity/mcp_config.json | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f'   - {name}') for name in data.get('mcpServers', {}).keys()]"
else
    echo "❌ mcp_config.json NO encontrado"
fi
echo ""

# Verificar npx
echo "📦 Verificando npx (para Google Analytics y GTM):"
which npx
if [ $? -eq 0 ]; then
    echo "✅ npx encontrado"
else
    echo "❌ npx NO encontrado"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 RESUMEN:"
echo ""
echo "Si todos los checks están en ✅, entonces:"
echo "1. Cierra completamente Claude Desktop"
echo "2. Vuelve a abrir Claude Desktop"
echo "3. Prueba preguntando: '¿Cuáles son las campañas activas en Google Ads?'"
echo ""
echo "Si hay ❌, revisa el archivo MCP_SETUP_STATUS.md para soluciones"
echo ""
