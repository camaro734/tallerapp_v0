"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wrench, Wifi, WifiOff, Copy } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { isSupabaseReady } from "@/lib/db"
import { toast } from "@/hooks/use-toast"

const testUsers = [
  {
    email: "admin@cmgplataformas.com",
    password: "admin123",
    role: "Administrador",
    name: "Administrador CMG",
    description: "Acceso completo al sistema",
  },
  {
    email: "jefe@cmgplataformas.com",
    password: "jefe123",
    role: "Jefe de Taller",
    name: "Carlos Martínez",
    description: "Gestión de personal y partes",
  },
  {
    email: "juan@cmgplataformas.com",
    password: "juan123",
    role: "Técnico",
    name: "Juan Pérez",
    description: "Técnico especialista en HIAB",
  },
  {
    email: "maria@cmgplataformas.com",
    password: "maria123",
    role: "Técnico",
    name: "María García",
    description: "Técnico especialista en Dhollandia",
  },
]

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || "Credenciales incorrectas. Verifica el email y contraseña.")
      }
    } catch (error) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail)
    setPassword(testPassword)
    setError("")
    setIsLoading(true)

    try {
      const result = await login(testEmail, testPassword)
      if (!result.success) {
        setError(result.error || "Error al iniciar sesión con usuario de prueba")
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const copyCredentials = (email: string, password: string) => {
    navigator.clipboard.writeText(`${email} / ${password}`)
    toast({
      title: "Credenciales copiadas",
      description: "Email y contraseña copiados al portapapeles",
    })
  }

  const connectionStatus = isSupabaseReady()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">CMG Plataformas</CardTitle>
          <CardDescription>Taller especializado en plataformas elevadoras y grúas</CardDescription>

          {/* Estado de conexión */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {connectionStatus ? (
              <Badge variant="default" className="bg-green-500">
                <Wifi className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-orange-500 text-white">
                <WifiOff className="h-3 w-3 mr-1" />
                Modo Demo
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@cmgplataformas.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Usuarios de prueba */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Usuarios de Prueba</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Haz clic para usar
              </Badge>
            </div>

            <div className="space-y-3">
              {testUsers.map((user, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{user.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{user.description}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{user.email}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyCredentials(user.email, user.password)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          Contraseña: {user.password}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTestLogin(user.email, user.password)}
                      disabled={isLoading}
                      className="ml-3"
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Usar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-center pt-4 border-t">
            <div className="text-xs text-gray-500 space-y-1">
              <div>🔧 Sistema de gestión para talleres especializados</div>
              <div>📱 Optimizado para dispositivos móviles</div>
              <div>💾 {connectionStatus ? "Datos en tiempo real" : "Modo demo con datos simulados"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
