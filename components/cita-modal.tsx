"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Edit, Trash2, User } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { type Cita, type Cliente, getClientes } from "@/lib/db"

interface CitaModalProps {
  cita: Cita | null
  isOpen: boolean
  onClose: () => void
  onSave: (citaId: string, updates: Partial<Cita>) => void
  onDelete: (citaId: string) => void
}

export function CitaModal({ cita, isOpen, onClose, onSave, onDelete }: CitaModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState<Partial<Cita>>({})

  useEffect(() => {
    if (cita) {
      setFormData({
        ...cita,
        fecha_hora: cita.fecha_hora,
      })
    }
  }, [cita])

  useEffect(() => {
    if (isEditing) {
      const fetchClientes = async () => {
        const { data } = await getClientes()
        if (data) setClientes(data)
      }
      fetchClientes()
    }
  }, [isEditing])

  if (!cita) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof Cita, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const currentDateTime = parseISO(formData.fecha_hora!)
      const newDateTime = new Date(date)
      newDateTime.setHours(currentDateTime.getHours(), currentDateTime.getMinutes())
      setFormData((prev) => ({ ...prev, fecha_hora: newDateTime.toISOString() }))
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    if (time && formData.fecha_hora) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDateTime = new Date(parseISO(formData.fecha_hora))
      newDateTime.setHours(hours, minutes)
      setFormData((prev) => ({ ...prev, fecha_hora: newDateTime.toISOString() }))
    }
  }

  const handleSaveChanges = () => {
    const updates: Partial<Cita> = {}
    // Compare formData with original cita to find changes
    for (const key in formData) {
      if (key in cita && formData[key as keyof Cita] !== cita[key as keyof Cita]) {
        updates[key as keyof Cita] = formData[key as keyof Cita]
      }
    }
    onSave(cita.id, updates)
    setIsEditing(false)
  }

  const renderViewMode = () => (
    <>
      <DialogHeader>
        <DialogTitle>Detalles de la Cita</DialogTitle>
        <DialogDescription>
          {format(parseISO(cita.fecha_hora), "eeee, d 'de' LLLL, yyyy 'a las' HH:mm", { locale: es })}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span>{cita.cliente_nombre || cita.cliente?.nombre || "Cliente no especificado"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {cita.tipo_servicio} ({cita.duracion_estimada} min)
          </span>
        </div>
        {cita.descripcion && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{cita.descripcion}</p>}
      </div>
      <DialogFooter className="sm:justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la cita permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(cita.id)}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogFooter>
    </>
  )

  const renderEditMode = () => (
    <>
      <DialogHeader>
        <DialogTitle>Editar Cita</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="space-y-2">
          <Label htmlFor="cliente_id">Cliente</Label>
          <Select
            value={formData.cliente_id || ""}
            onValueChange={(value) => handleSelectChange("cliente_id", value)}
            disabled={!!formData.cliente_nombre}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.cliente_nombre && <Input value={formData.cliente_nombre} disabled className="mt-2" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.fecha_hora ? format(parseISO(formData.fecha_hora), "PPP", { locale: es }) : "Elige fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.fecha_hora ? parseISO(formData.fecha_hora) : undefined}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={formData.fecha_hora ? format(parseISO(formData.fecha_hora), "HH:mm") : ""}
              onChange={handleTimeChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo_servicio">Tipo de Servicio</Label>
          <Input id="tipo_servicio" value={formData.tipo_servicio || ""} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duracion_estimada">Duración (minutos)</Label>
          <Input
            id="duracion_estimada"
            type="number"
            value={formData.duracion_estimada || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea id="descripcion" value={formData.descripcion || ""} onChange={handleInputChange} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => setIsEditing(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
      </DialogFooter>
    </>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">{isEditing ? renderEditMode() : renderViewMode()}</DialogContent>
    </Dialog>
  )
}
