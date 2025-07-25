"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { toast } from "@/hooks/use-toast"

interface DatabaseStats {
  usuarios: number
  clientes: number
  vehiculos: number
  materiales: number
  partes_trabajo: number
  fichajes: number
  citas: number
}

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      // Test basic connection
      const { data, error } = await supabase.from("usuarios").select("count", { count: "exact", head: true })

      if (error) {
        console.error("Database connection error:", error)
        setIsConnected(false)
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar a la base de datos",
          variant: "destructive",
        })
        return
      }

      // Get detailed stats
      const [
        usuariosResult,
        clientesResult,
        vehiculosResult,
        materialesResult,
        partesResult,
        fichajesResult,
        citasResult,
      ] = await Promise.all([
        supabase.from("usuarios").select("count", { count: "exact", head: true }),
        supabase.from("clientes").select("count", { count: "exact", head: true }),
        supabase.from("vehiculos").select("count", { count: "exact", head: true }),
        supabase.from("materiales").select("count", { count: "exact", head: true }),
        supabase.from("partes_trabajo").select("count", { count: "exact", head: true }),
        supabase.from("fichajes").select("count", { count: "exact", head: true }),
        supabase.from("citas").select("count", { count: "exact", head: true }),
      ])

      setStats({
        usuarios: usuariosResult.count || 0,
        clientes: clientesResult.count || 0,
        vehiculos: vehiculosResult.count || 0,
        materiales: materialesResult.count || 0,
        partes_trabajo: partesResult.count || 0,
        fichajes: fichajesResult.count || 0,
        citas: citasResult.count || 0,
      })

      setIsConnected(true)
      setLastCheck(new Date())

      toast({
        title: "Conexión exitosa",
        description: "Base de datos Supabase conectada correctamente",
      })
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
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Sin conexión
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
        {stats && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Usuarios:</span>
              <span className="font-mono">{stats.usuarios}</span>
            </div>
            <div className="flex justify-between">
              <span>Clientes:</span>
              <span className="font-mono">{stats.clientes}</span>
            </div>
            <div className="flex justify-between">
              <span>Vehículos:</span>
              <span className="font-mono">{stats.vehiculos}</span>
            </div>
            <div className="flex justify-between">
              <span>Materiales:</span>
              <span className="font-mono">{stats.materiales}</span>
            </div>
            <div className="flex justify-between">
              <span>Partes:</span>
              <span className="font-mono">{stats.partes_trabajo}</span>
            </div>
            <div className="flex justify-between">
              <span>Fichajes:</span>
              <span className="font-mono">{stats.fichajes}</span>
            </div>
            <div className="flex justify-between">
              <span>Citas:</span>
              <span className="font-mono">{stats.citas}</span>
            </div>
          </div>
        )}

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
