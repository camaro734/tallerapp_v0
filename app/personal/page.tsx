import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, Clock, CheckCircle, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"

export default function PersonalPage() {
  const empleados = [
    {
      id: 1,
      nombre: "Juan Pérez",
      puesto: "Técnico Senior",
      telefono: "666 123 456",
      email: "juan.perez@cmghidraulica.com",
      estado: "Activo",
      horasHoy: "7h 30m",
      horasSemana: "38h 15m",
      ultimoFichaje: "08:00 - Entrada",
    },
    {
      id: 2,
      nombre: "María González",
      puesto: "Técnico",
      telefono: "677 234 567",
      email: "maria.gonzalez@cmghidraulica.com",
      estado: "Activo",
      horasHoy: "8h 00m",
      horasSemana: "40h 00m",
      ultimoFichaje: "08:15 - Entrada",
    },
    {
      id: 3,
      nombre: "Carlos Ruiz",
      puesto: "Técnico",
      telefono: "688 345 678",
      email: "carlos.ruiz@cmghidraulica.com",
      estado: "Vacaciones",
      horasHoy: "0h 00m",
      horasSemana: "0h 00m",
      ultimoFichaje: "Vacaciones hasta 20/01",
    },
    {
      id: 4,
      nombre: "Ana Martín",
      puesto: "Administrativa",
      telefono: "699 456 789",
      email: "ana.martin@cmghidraulica.com",
      estado: "Activo",
      horasHoy: "8h 00m",
      horasSemana: "40h 00m",
      ultimoFichaje: "09:00 - Entrada",
    },
  ]

  const fichajes = [
    { empleado: "Juan Pérez", hora: "08:00", tipo: "Entrada", fecha: "16/01/2024" },
    { empleado: "María González", hora: "08:15", tipo: "Entrada", fecha: "16/01/2024" },
    { empleado: "Ana Martín", hora: "09:00", tipo: "Entrada", fecha: "16/01/2024" },
    { empleado: "Juan Pérez", hora: "12:00", tipo: "Pausa", fecha: "16/01/2024" },
    { empleado: "María González", hora: "12:30", tipo: "Pausa", fecha: "16/01/2024" },
  ]

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personal</h1>
            <p className="text-gray-600">Gestión de empleados y fichajes</p>
          </div>
          <Link href="/personal/nuevo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Empleado
            </Button>
          </Link>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Empleados</p>
                  <p className="text-xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Activos Hoy</p>
                  <p className="text-xl font-bold">6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-600">En Vacaciones</p>
                  <p className="text-xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Horas Semana</p>
                  <p className="text-xl font-bold">238h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de empleados */}
          <Card>
            <CardHeader>
              <CardTitle>Empleados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {empleados.map((empleado) => (
                  <div key={empleado.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar>
                      <AvatarFallback>
                        {empleado.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{empleado.nombre}</h3>
                        <Badge variant={empleado.estado === "Activo" ? "default" : "secondary"}>
                          {empleado.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{empleado.puesto}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {empleado.telefono}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {empleado.email}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <p className="font-medium">{empleado.horasHoy}</p>
                      <p className="text-gray-500">Hoy</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fichajes recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Fichajes de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fichajes.map((fichaje, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          fichaje.tipo === "Entrada"
                            ? "bg-green-500"
                            : fichaje.tipo === "Salida"
                              ? "bg-red-500"
                              : "bg-amber-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-sm">{fichaje.empleado}</p>
                        <p className="text-xs text-gray-500">{fichaje.tipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{fichaje.hora}</p>
                      <p className="text-xs text-gray-500">{fichaje.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Horas trabajadas por empleado */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen Semanal de Horas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Empleado</th>
                    <th className="text-center p-2">Lunes</th>
                    <th className="text-center p-2">Martes</th>
                    <th className="text-center p-2">Miércoles</th>
                    <th className="text-center p-2">Jueves</th>
                    <th className="text-center p-2">Viernes</th>
                    <th className="text-center p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((empleado) => (
                    <tr key={empleado.id} className="border-b">
                      <td className="p-2 font-medium">{empleado.nombre}</td>
                      <td className="text-center p-2">8h</td>
                      <td className="text-center p-2">8h</td>
                      <td className="text-center p-2">7.5h</td>
                      <td className="text-center p-2">8h</td>
                      <td className="text-center p-2">6.5h</td>
                      <td className="text-center p-2 font-medium">{empleado.horasSemana}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
