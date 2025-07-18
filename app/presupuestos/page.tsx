import { MainLayout } from "@/components/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText, Euro, Calendar, User, Send, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function PresupuestosPage() {
  const presupuestos = [
    {
      id: "PRES-2024-001",
      cliente: "Transportes García S.L.",
      descripcion: "Reparación sistema hidráulico grúa móvil",
      importe: 1250.0,
      fecha: "2024-01-15",
      estado: "Enviado",
      validez: "2024-02-15",
    },
    {
      id: "PRES-2024-002",
      cliente: "Construcciones López",
      descripcion: "Mantenimiento plataforma elevadora",
      importe: 850.0,
      fecha: "2024-01-14",
      estado: "Aceptado",
      validez: "2024-02-14",
    },
    {
      id: "PRES-2024-003",
      cliente: "Logística Madrid",
      descripcion: "Revisión completa sistema hidráulico",
      importe: 2100.0,
      fecha: "2024-01-13",
      estado: "Pendiente",
      validez: "2024-02-13",
    },
  ]

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
            <p className="text-gray-600">Gestión de presupuestos y cotizaciones</p>
          </div>
          <Link href="/presupuestos/nuevo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </Link>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Presupuestos</p>
                  <p className="text-xl font-bold">15</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-600">Enviados</p>
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
                  <p className="text-sm text-gray-600">Aceptados</p>
                  <p className="text-xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold">€18.500</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Buscar por cliente o ID..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="aceptado">Aceptado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de presupuestos */}
        <div className="space-y-4">
          {presupuestos.map((presupuesto) => (
            <Card key={presupuesto.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{presupuesto.id}</h3>
                      <Badge
                        variant={
                          presupuesto.estado === "Aceptado"
                            ? "default"
                            : presupuesto.estado === "Enviado"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {presupuesto.estado}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {presupuesto.cliente}
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4" />
                        {presupuesto.importe.toFixed(2)} €
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha: {presupuesto.fecha}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Válido hasta: {presupuesto.validez}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{presupuesto.descripcion}</p>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    {presupuesto.estado === "Pendiente" && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    )}
                    {presupuesto.estado === "Aceptado" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Crear Parte
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
