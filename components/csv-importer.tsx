"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, CheckCircle, AlertTriangle, X } from "lucide-react"

interface ClienteCSV {
  nombre: string
  cif: string
  telefono: string
  email: string
  direccion: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export function CSVImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ClienteCSV[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imported, setImported] = useState(false)

  const downloadTemplate = () => {
    const template = `nombre,cif,telefono,email,direccion
"Transportes García S.L.","B12345678","666123456","info@transportesgarcia.com","Calle Industrial 1, Madrid"
"Logística Martín","B87654321","677987654","contacto@logisticamartin.com","Polígono Sur 25, Barcelona"
"Distribuciones López","B11223344","688112233","ventas@distlopez.com","Avenida Comercial 15, Valencia"`

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "plantilla_clientes.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const validateData = (data: ClienteCSV[]): ValidationError[] => {
    const errors: ValidationError[] = []

    data.forEach((row, index) => {
      // Validar nombre (obligatorio)
      if (!row.nombre || row.nombre.trim() === "") {
        errors.push({
          row: index + 1,
          field: "nombre",
          message: "El nombre es obligatorio",
        })
      }

      // Validar CIF (obligatorio y formato básico)
      if (!row.cif || row.cif.trim() === "") {
        errors.push({
          row: index + 1,
          field: "cif",
          message: "El CIF es obligatorio",
        })
      } else if (!/^[A-Z]\d{8}$|^[A-Z]\d{7}[A-Z]$|^\d{8}[A-Z]$/.test(row.cif.trim())) {
        errors.push({
          row: index + 1,
          field: "cif",
          message: "Formato de CIF inválido",
        })
      }

      // Validar teléfono (obligatorio)
      if (!row.telefono || row.telefono.trim() === "") {
        errors.push({
          row: index + 1,
          field: "telefono",
          message: "El teléfono es obligatorio",
        })
      }

      // Validar email (opcional pero si existe debe ser válido)
      if (row.email && row.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(row.email.trim())) {
          errors.push({
            row: index + 1,
            field: "email",
            message: "Formato de email inválido",
          })
        }
      }
    })

    return errors
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".csv")) {
      alert("Por favor, selecciona un archivo CSV válido")
      return
    }

    setFile(selectedFile)
    setImported(false)
    setErrors([])
    setData([])

    // Leer y parsear el archivo CSV
    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result as string
      const lines = csv.split("\n")
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

      const parsedData: ClienteCSV[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === "") continue

        const values = line.split(",").map((v) => v.replace(/"/g, "").trim())

        if (values.length >= 3) {
          // Al menos nombre, cif, telefono
          parsedData.push({
            nombre: values[0] || "",
            cif: values[1] || "",
            telefono: values[2] || "",
            email: values[3] || "",
            direccion: values[4] || "",
          })
        }
      }

      setData(parsedData)

      // Validar datos
      const validationErrors = validateData(parsedData)
      setErrors(validationErrors)
    }

    reader.readAsText(selectedFile)
  }

  const importData = async () => {
    if (errors.length > 0) {
      alert("Por favor, corrige los errores antes de importar")
      return
    }

    setImporting(true)
    setProgress(0)

    try {
      // Simular importación con progreso
      for (let i = 0; i < data.length; i++) {
        // Aquí iría la lógica real de inserción en la base de datos
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress(((i + 1) / data.length) * 100)
      }

      setImported(true)
      alert(`Se han importado ${data.length} clientes correctamente`)
    } catch (error) {
      console.error("Error importando datos:", error)
      alert("Error al importar los datos")
    } finally {
      setImporting(false)
    }
  }

  const clearData = () => {
    setFile(null)
    setData([])
    setErrors([])
    setImported(false)
    setProgress(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importador CSV de Clientes
        </CardTitle>
        <CardDescription>Importa clientes masivamente desde un archivo CSV</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Descargar plantilla */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Plantilla CSV</h3>
              <p className="text-sm text-blue-700">Descarga la plantilla para estructurar tus datos</p>
            </div>
          </div>
          <Button onClick={downloadTemplate} variant="outline" className="border-blue-200 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
        </div>

        {/* Seleccionar archivo */}
        <div className="space-y-4">
          <Label htmlFor="csv-file">Seleccionar archivo CSV</Label>
          <div className="flex items-center gap-4">
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="flex-1" />
            {file && (
              <Button onClick={clearData} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Mostrar errores */}
        {errors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Se encontraron {errors.length} errores:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      <Badge variant="destructive" className="mr-2">
                        Fila {error.row}
                      </Badge>
                      <span className="font-medium">{error.field}:</span> {error.message}
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Vista previa de datos */}
        {data.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vista Previa ({data.length} registros)</h3>
              <div className="flex gap-2">
                {errors.length === 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sin errores
                  </Badge>
                )}
                {errors.length > 0 && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.length} errores
                  </Badge>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>CIF</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Dirección</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 10).map((cliente, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>{cliente.cif}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.direccion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length > 10 && (
                <div className="p-3 bg-gray-50 text-center text-sm text-gray-600">
                  ... y {data.length - 10} registros más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progreso de importación */}
        {importing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Importando datos...</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Botón de importar */}
        {data.length > 0 && !imported && (
          <div className="flex justify-end">
            <Button
              onClick={importData}
              disabled={importing || errors.length > 0}
              className="industrial-button text-white"
            >
              {importing ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {data.length} Clientes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Mensaje de éxito */}
        {imported && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>¡Importación completada exitosamente!</span>
                <Button onClick={clearData} variant="outline" size="sm">
                  Importar Más
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
