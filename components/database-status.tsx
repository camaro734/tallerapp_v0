"use client"

import { isSupabaseReady } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function DatabaseStatus() {
  if (isSupabaseReady()) {
    return null // No mostrar nada si está configurado
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Modo de desarrollo:</strong> La aplicación está funcionando con datos de prueba. Para usar la base de
        datos real, configura las variables de entorno de Supabase en el archivo .env.local
      </AlertDescription>
    </Alert>
  )
}
