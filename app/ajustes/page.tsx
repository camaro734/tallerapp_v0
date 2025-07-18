"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Users,
  Database,
  Bell,
  Shield,
  Download,
  Upload,
  Save,
  UserPlus,
  Trash2,
  Edit,
  FileText,
} from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/components/auth-provider"
import { DatabaseStatus } from "@/components/database-status"
import { CSVImporter } from "@/components/csv-importer"

export default function AjustesPage() {
  const { user } = useAuth()
  const [configuracion, setConfiguracion] = useState({
    empresa: {
      nombre: "CMG Hidráulica",
      cif: "B12345678",
      direccion: "Calle Industrial 123, 28001 Madrid",
      telefono: "+34 91 123 45 67",
      email: "info@cmghidraulica.com",
      web: "www.cmghidraulica.com",
    },
    sistema: {
      notificaciones_email: true,
      notificaciones_push: true,
      backup_automatico: true,
      tema_oscuro: false,
      idioma: "es",
    },
    facturacion: {
      iva_defecto: 21,
      moneda: "EUR",
      numeracion_automatica: true,
      prefijo_factura: "FAC-",
      prefijo_presupuesto: "PRE-",
    },
  })

  const [usuarios] = useState([
    { id: 1, nombre: "Admin CMG", email: "admin@cmg.com", rol: "admin", activo: true },
    { id: 2, nombre: "Juan Técnico", email: "juan@cmg.com", rol: "tecnico", activo: true },
    { id: 3, nombre: "María Jefe", email: "maria@cmg.com", rol: "jefe_taller", activo: true },
  ])

  const handleConfigChange = (seccion: string, campo: string, valor: any) => {
    setConfiguracion((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion as keyof typeof prev],
        [campo]: valor,
      },
    }))
  }

  const guardarConfiguracion = () => {
    // Aquí iría la lógica para guardar en la base de datos
    alert("Configuración guardada correctamente")
  }

  const exportarDatos = () => {
    // Lógica para exportar datos
    alert("Exportando datos...")
  }

  if (!user || user.rol !== "admin") {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
              <p className="text-gray-600">Solo los administradores pueden acceder a esta sección.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Gestiona la configuración del sistema</p>
          </div>
          <Button onClick={guardarConfiguracion} className="industrial-button text-white">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
            <TabsTrigger value="datos">Datos</TabsTrigger>
            <TabsTrigger value="database">Base de Datos</TabsTrigger>
          </TabsList>

          {/* Configuración de Empresa */}
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Información de la Empresa
                </CardTitle>
                <CardDescription>Configura los datos básicos de tu empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre_empresa">Nombre de la Empresa</Label>
                    <Input
                      id="nombre_empresa"
                      value={configuracion.empresa.nombre}
                      onChange={(e) => handleConfigChange("empresa", "nombre", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cif">CIF/NIF</Label>
                    <Input
                      id="cif"
                      value={configuracion.empresa.cif}
                      onChange={(e) => handleConfigChange("empresa", "cif", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={configuracion.empresa.direccion}
                      onChange={(e) => handleConfigChange("empresa", "direccion", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={configuracion.empresa.telefono}
                      onChange={(e) => handleConfigChange("empresa", "telefono", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email_empresa">Email</Label>
                    <Input
                      id="email_empresa"
                      type="email"
                      value={configuracion.empresa.email}
                      onChange={(e) => handleConfigChange("empresa", "email", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="web">Página Web</Label>
                    <Input
                      id="web"
                      value={configuracion.empresa.web}
                      onChange={(e) => handleConfigChange("empresa", "web", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestión de Usuarios */}
          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription>Administra los usuarios del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Usuarios Registrados</h3>
                  <Button className="industrial-button text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </div>
                <div className="space-y-3">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{usuario.nombre}</p>
                          <p className="text-sm text-gray-600">{usuario.email}</p>
                        </div>
                        <Badge variant={usuario.activo ? "default" : "secondary"}>
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </Badge>
                        <Badge variant="outline">{usuario.rol}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración del Sistema */}
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración del Sistema
                </CardTitle>
                <CardDescription>Personaliza el comportamiento del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificaciones</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-email">Notificaciones por Email</Label>
                      <p className="text-sm text-gray-600">Recibir notificaciones importantes por correo</p>
                    </div>
                    <Switch
                      id="notif-email"
                      checked={configuracion.sistema.notificaciones_email}
                      onCheckedChange={(checked) => handleConfigChange("sistema", "notificaciones_email", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-push">Notificaciones Push</Label>
                      <p className="text-sm text-gray-600">Notificaciones en tiempo real en el navegador</p>
                    </div>
                    <Switch
                      id="notif-push"
                      checked={configuracion.sistema.notificaciones_push}
                      onCheckedChange={(checked) => handleConfigChange("sistema", "notificaciones_push", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Apariencia</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="tema-oscuro">Tema Oscuro</Label>
                      <p className="text-sm text-gray-600">Usar tema oscuro en la interfaz</p>
                    </div>
                    <Switch
                      id="tema-oscuro"
                      checked={configuracion.sistema.tema_oscuro}
                      onCheckedChange={(checked) => handleConfigChange("sistema", "tema_oscuro", checked)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idioma">Idioma</Label>
                      <Select
                        value={configuracion.sistema.idioma}
                        onValueChange={(value) => handleConfigChange("sistema", "idioma", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Seguridad y Backup</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-auto">Backup Automático</Label>
                      <p className="text-sm text-gray-600">Realizar copias de seguridad automáticas</p>
                    </div>
                    <Switch
                      id="backup-auto"
                      checked={configuracion.sistema.backup_automatico}
                      onCheckedChange={(checked) => handleConfigChange("sistema", "backup_automatico", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración de Facturación */}
          <TabsContent value="facturacion">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Configuración de Facturación
                </CardTitle>
                <CardDescription>Configura los parámetros de facturación y presupuestos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="iva-defecto">IVA por Defecto (%)</Label>
                    <Input
                      id="iva-defecto"
                      type="number"
                      value={configuracion.facturacion.iva_defecto}
                      onChange={(e) => handleConfigChange("facturacion", "iva_defecto", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="moneda">Moneda</Label>
                    <Select
                      value={configuracion.facturacion.moneda}
                      onValueChange={(value) => handleConfigChange("facturacion", "moneda", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="GBP">Libra (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prefijo-factura">Prefijo Facturas</Label>
                    <Input
                      id="prefijo-factura"
                      value={configuracion.facturacion.prefijo_factura}
                      onChange={(e) => handleConfigChange("facturacion", "prefijo_factura", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prefijo-presupuesto">Prefijo Presupuestos</Label>
                    <Input
                      id="prefijo-presupuesto"
                      value={configuracion.facturacion.prefijo_presupuesto}
                      onChange={(e) => handleConfigChange("facturacion", "prefijo_presupuesto", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="numeracion-auto">Numeración Automática</Label>
                    <p className="text-sm text-gray-600">Generar números de factura automáticamente</p>
                  </div>
                  <Switch
                    id="numeracion-auto"
                    checked={configuracion.facturacion.numeracion_automatica}
                    onCheckedChange={(checked) => handleConfigChange("facturacion", "numeracion_automatica", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestión de Datos */}
          <TabsContent value="datos">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Importar/Exportar Datos
                  </CardTitle>
                  <CardDescription>Gestiona la importación y exportación de datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={exportarDatos} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Datos
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Datos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Importador CSV de Clientes */}
              <CSVImporter />
            </div>
          </TabsContent>

          {/* Estado de la Base de Datos */}
          <TabsContent value="database">
            <DatabaseStatus />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
