#!/bin/bash
# ============================================================
# Grab It MVP — Script de instalación
# Ejecutar desde la carpeta grabit-app
# ============================================================

echo ""
echo "🚀 Instalando Grab It MVP..."
echo ""

# 1. Instalar dependencias
echo "📦 Paso 1/3: Instalando dependencias (puede tomar 2-3 min)..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ Error en npm install. Verifica tu conexión a internet."
  exit 1
fi

echo "✅ Dependencias instaladas"
echo ""

# 2. Agregar componentes shadcn/ui
echo "🎨 Paso 2/3: Instalando componentes de UI..."
npx shadcn@latest add button input label select badge dialog table form toast dropdown-menu tabs card sheet avatar skeleton separator textarea popover command scroll-area alert --yes

if [ $? -ne 0 ]; then
  echo "⚠️  Algunos componentes shadcn pueden no haberse instalado."
  echo "    Intenta manualmente: npx shadcn@latest add [componente]"
fi

echo "✅ Componentes UI instalados"
echo ""

# 3. Verificar .env.local
echo "🔑 Paso 3/3: Verificando configuración..."
if [ ! -f ".env.local" ]; then
  echo "⚠️  No se encontró .env.local — cópialo de .env.local.example"
else
  if grep -q "TU_URL_AQUI" .env.local; then
    echo "⚠️  .env.local tiene valores de ejemplo — reemplázalos con tus credenciales de Supabase"
  else
    echo "✅ .env.local encontrado"
  fi
fi

echo ""
echo "============================================================"
echo "✅ Instalación completa."
echo ""
echo "Próximos pasos:"
echo "  1. Configura tu .env.local con las claves de Supabase"
echo "  2. Ejecuta el schema en Supabase: grabit-schema.sql"
echo "  3. Levanta el servidor: npm run dev"
echo "  4. Abre: http://localhost:3000"
echo "============================================================"
echo ""
