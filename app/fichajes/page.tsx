"use client"

import { useState, useEffect, useMemo } from "react"
import { type Fichaje, type Usuario, getAllFichajes, getUsuarios } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function FichajesPage() {
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      const [fichajesRes, usuariosRes] = await Promise.all([getAllFichajes(), getUsuarios()])
      setFichajes(fichajesRes.data || [])
      setUsuarios(usuariosRes.data || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  const filteredFichajes = useMemo(() => {
    return fichajes
      .filter((f) => {
        const fechaFichaje = new Date(f.fecha_hora)
        const fromOk = !dateRange.from || fechaFichaje >= dateRange.from
        const toOk = !dateRange.to || fechaFichaje <= dateRange.to
        const userOk = selectedUser === "all" || f.usuario_id === selectedUser
        const searchOk =
          searchTerm === "" ||
          f.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.usuario?.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.parte_trabajo?.numero_parte?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
        return fromOk && toOk && userOk && searchOk
      })
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
  }, [fichajes, searchTerm, selectedUser, dateRange])

  if (loading) {
    return <div>Cargando fichajes...</div>
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Registro de Fichajes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar por empleado, parte, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar empleado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los empleados</SelectItem>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* TODO: Add Date Range Picker */}
        </CardContent>
      </Card>
      <div className="border rounded-lg overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Entrada/Salida</TableHead>
              <TableHead>Parte de Trabajo</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFichajes.map((fichaje) => (
              <TableRow key={fichaje.id}>
                <TableCell>
                  {fichaje.usuario?.nombre} {fichaje.usuario?.apellidos}
                </TableCell>
                <TableCell>{format(new Date(fichaje.fecha_hora), "dd/MM/yyyy HH:mm:ss", { locale: es })}</TableCell>
                <TableCell className="capitalize">{fichaje.tipo}</TableCell>
                <TableCell className="capitalize">{fichaje.tipo_fichaje}</TableCell>
                <TableCell>
                  {fichaje.parte_trabajo_id ? (
                    <Link href={`/partes/${fichaje.parte_trabajo_id}`} className="text-blue-600 hover:underline">
                      {fichaje.parte_trabajo?.numero_parte || "Ver parte"}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>{fichaje.observaciones}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
