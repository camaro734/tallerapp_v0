"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { isSupabaseReady } from "@/lib/db"

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setIsConnected(isSupabaseReady())
  }, [])

  return (
    <div className="absolute top-4 right-4">
      {isConnected ? (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <Wifi className="h-3 w-3 mr-1" />
          Conectado
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
          <WifiOff className="h-3 w-3 mr-1" />
          Modo Demo
        </Badge>
      )}
    </div>
  )
}
