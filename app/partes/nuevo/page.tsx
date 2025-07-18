"use client"

import { MainLayout } from "@/components/main-layout"
import { NuevoParteForm } from "@/components/nuevo-parte-form"

export default function NuevoPartePage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Parte de Trabajo</h1>
          <p className="text-gray-600 mt-2">Crear un nuevo parte de trabajo</p>
        </div>

        <NuevoParteForm />
      </div>
    </MainLayout>
  )
}
