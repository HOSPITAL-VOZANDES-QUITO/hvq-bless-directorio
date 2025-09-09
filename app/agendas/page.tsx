"use client"

import { DirectorioLayout } from "@/components/directorio-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { useAgendas } from "@/hooks/use-agendas"

/**
 * Página de agendas médicas
 * Utiliza el hook useAgendas para separar la lógica de negocio de la presentación
 */
export default function AgendasPage() {
  // Usar el hook personalizado para gestionar toda la lógica de negocio
  const {
    agendasFiltradas,
    edificios,
    pisos,
    loading,
    error,
    filters,
    setEdificioSeleccionado,
    setPisoSeleccionado,
    reload
  } = useAgendas()

  // Estado de carga
  if (loading) {
    return (
      <DirectorioLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      </DirectorioLayout>
    )
  }

  // Estado de error
  if (error) {
    return (
      <DirectorioLayout>
        <div className="error-container">
          <h2>No se encontraron agendas</h2>
          <button className="retry-button" onClick={reload}>
            Reintentar
          </button>
        </div>
      </DirectorioLayout>
    )
  }

  return (
    <DirectorioLayout>
      <Card className="w-full max-w-5xl">
        <CardContent className="p-4 md:p-6">
          {/* Filtros de edificio y piso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-medium">Edificio</label>
              <Select value={filters.edificioSeleccionado} onValueChange={setEdificioSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los edificios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {edificios.map((e) => (
                    <SelectItem key={String(e.codigo ?? e.id)} value={String(e.codigo ?? e.id)}>
                      {String(e.nombre ?? e.descripcion ?? e.name ?? e.codigo ?? e.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 font-medium">Piso</label>
              <Select value={filters.pisoSeleccionado} onValueChange={setPisoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los pisos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {pisos.map((p) => (
                    <SelectItem key={String(p.codigo ?? p.id)} value={String(p.codigo ?? p.id)}>
                      {String(p.nombre ?? p.descripcion ?? p.name ?? p.codigo ?? p.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla de agendas */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Día</TableHead>
                  <TableHead>Consultorio</TableHead>
                  <TableHead>Edificio</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendasFiltradas.map((a, idx) => (
                  <TableRow key={a.id ?? idx}>
                    <TableCell>{a.diaNombre || a.dia || ""}</TableCell>
                    <TableCell>{a.consultorioNombre || a.consultorioCodigo}</TableCell>
                    <TableCell>{a.edificio}</TableCell>
                    <TableCell>{a.piso}</TableCell>
                    <TableCell>{a.hora ?? a.horario ?? a.horaInicio ?? ""}</TableCell>
                    <TableCell>{a.tipo ?? ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DirectorioLayout>
  )
}