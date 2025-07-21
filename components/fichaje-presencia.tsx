"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, LogIn, LogOut, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUltimoFichajePresencia, createFichajePresencia } from "@/lib/db"

export function FichajePresencia() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPresent, setIsPresent] = useState(false)
  const [lastEntry, setLastEntry] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user) {
      checkPresenceStatus()
    }
  }, [user])

  const checkPresenceStatus = async () => {
    if (!user) return

    try {
      const { data: lastFichaje, error } = await getUltimoFichajePresencia(user.id)
      if (error) throw error

      if (lastFichaje) {
        setIsPresent(lastFichaje.tipo_fichaje === "entrada")
        setLastEntry(
          lastFichaje.tipo_fichaje === "entrada"
            ? `Entrada - ${new Date(lastFichaje.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : `Salida - ${new Date(lastFichaje.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        )
      } else {
        setIsPresent(false)
        setLastEntry(null)
      }
    } catch (error) {
      console.error("Error checking presence:", error)
    }
  }

  const handleFichaje = async () => {
    if (!user || isLoading) return

    setIsLoading(true)
    try {
      const tipo = isPresent ? "salida" : "entrada"
      const { error } = await createFichajePresencia(user.id, tipo)
      if (error) throw error
      await checkPresenceStatus()
    } catch (error) {
      console.error("Error en fichaje:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          Control de Presencia
        </div>

        <div className="text-center">
          <div className="text-2xl font-mono font-bold">{formatTime(currentTime)}</div>
          <div className="text-sm text-gray-600">{formatDate(currentTime)}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user.nombre.split(" ")[0]}</span>
          </div>
          <Badge variant={isPresent ? "default" : "secondary"} className={isPresent ? "bg-green-500" : "bg-gray-500"}>
            {isPresent ? "Presente" : "Ausente"}
          </Badge>
        </div>

        {lastEntry && <div className="text-center text-sm text-gray-600">{lastEntry}</div>}

        <Button
          onClick={handleFichaje}
          disabled={isLoading}
          className={`w-full ${
            isPresent ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <>
              {isPresent ? <LogOut className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
              {isPresent ? "Marcar Salida" : "Marcar Entrada"}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">Registra tu entrada y salida del taller</p>
      </CardContent>
    </Card>
  )
}
