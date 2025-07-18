import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, MapPin, User, Phone } from "lucide-react"
import Link from "next/link"

export default function AgendaPage() {
  const citas = [
    {
      id: 1,
      fecha: "2024-01-16",
      hora: "09:00",
      cliente: "Transportes García S.L.",
      contacto: "José García",
      telefono: "666 123 456",
      tipo: "Revisión grúa móvil",
      tecnico: "Juan Pérez",
      ubicacion: "Polígono Industrial Norte",
      estado: "Confirmada",
    },
    {
      id: 2,
      fecha: "2024-01-16",
      hora: "11:30",
      cliente: "Construcciones López",
      contacto: "Ana López",
      telefono: "677 234 567",
      tipo: "Reparación plataforma elevadora",
      tecnico: "María González",
      ubicacion: "Calle Mayor 45",
      estado: "Pendiente",
    },
    {
      id: 3,
      fecha: "2024-01-16",
      hora: "14:00",
      cliente: "Logística Madrid",
      contacto: "Carlos Martín",
      telefono: "688 345 678",
      tipo: "Mantenimiento sistema hidráulico",
      tecnico: "Carlos Ruiz",
      ubicacion: "Nave 12, Sector B",
      estado: "Confirmada",
    },
  ]

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600">Gestión de citas y trabajos programados</p>
          </div>
          <Link href="/agenda/nuevo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </Link>
        </div>

        {/* Vista de calendario simplificada */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Martes, 16 de Enero 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {["L", "M", "X", "J", "V", "S", "D"].map((dia) => (
                <div key={dia} className="p-2 font-medium text-gray-500">
                  {dia}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <div
                  key={i + 1}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    i + 1 === 16 ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de citas del día */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Citas de Hoy</h2>

          {citas.map((cita) => (
            <Card key={cita.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg flex-shrink-0">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{cita.hora.split(":")[0]}</div>
                      <div className="text-xs text-blue-600">{cita.hora.split(":")[1]}</div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{cita.cliente}</h3>
                      <Badge variant={cita.estado === "Confirmada" ? "default" : "outline"}>{cita.estado}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {cita.contacto}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {cita.telefono}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {cita.tipo}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Técnico: {cita.tecnico}
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4" />
                        {cita.ubicacion}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button variant="outline" size="sm">
                      Editar Cita
                    </Button>
                    <Button variant="outline" size="sm">
                      Crear Parte
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recordatorios */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Cita en 30 minutos</p>
                  <p className="text-sm text-amber-600">Construcciones López - 11:30</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Mañana: 5 citas programadas</p>
                  <p className="text-sm text-blue-600">Revisar disponibilidad de técnicos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
