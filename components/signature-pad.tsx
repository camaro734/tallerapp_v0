"use client"

import { useRef, useState } from "react"
import SignaturePad from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignaturePadProps {
  onConfirm: (signature: string, dni: string) => void
  onCancel: () => void
}

export default function SignaturePadComponent({ onConfirm, onCancel }: SignaturePadProps) {
  const sigPadRef = useRef<SignaturePad>(null)
  const [isSigned, setIsSigned] = useState(false)
  const [dni, setDni] = useState("")

  const handleClear = () => {
    sigPadRef.current?.clear()
    setIsSigned(false)
  }

  const handleConfirm = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty() && dni.trim() !== "") {
      const signature = sigPadRef.current.toDataURL()
      onConfirm(signature, dni.trim())
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg">
      <div className="border rounded-md bg-white">
        <SignaturePad
          ref={sigPadRef}
          canvasProps={{ className: "w-full h-48 rounded-md" }}
          onBegin={() => setIsSigned(true)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dni">DNI del Firmante</Label>
        <Input
          id="dni"
          placeholder="Introduzca el DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
          className="bg-white"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={handleClear} disabled={!isSigned}>
          Limpiar
        </Button>
        <Button onClick={handleConfirm} disabled={!isSigned || dni.trim() === ""}>
          Confirmar Firma
        </Button>
      </div>
    </div>
  )
}
