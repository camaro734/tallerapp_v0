"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { testSupabaseConnection, isSupabaseReady } from "@/lib/db"
import { toast } from "@/hooks/use-toast"

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      if (!isSupabaseReady()) {
        setIsConnected(false)
        toast({
          title: "Modo Demo",
          description: "Usando datos de prueba - Supabase no configurado",
        })
        return
      }

      const result = await testSupabaseConnection()
      setIsConnected(result.connected)
      setLastCheck(new Date())

      if (result.connected) {
        toast({
          title: "Conexión exitosa",
          description: "Base de datos Supabase conectada correctamente",
        })
      } else {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con Supabase",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setIsConnected(false)
      toast({
        title: "Error de conexión",
        description: "Fallo al conectar con Supabase",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Verificando...
        </Badge>
      )
    }

    if (isConnected === true) {
      return (
        <Badge variant="default" className="bg-green-500 flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          Supabase Conectado
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="bg-orange-500 flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Modo Demo
      </Badge>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Estado de Base de Datos
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {lastCheck && (
          <p className="text-xs text-muted-foreground">Última verificación: {lastCheck.toLocaleTimeString()}</p>
        )}

        <Button onClick={checkConnection} disabled={isLoading} size="sm" className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Verificar Conexión
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
