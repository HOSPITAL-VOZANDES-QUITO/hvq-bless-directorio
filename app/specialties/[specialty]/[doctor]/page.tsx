"use client"

import { DirectorioLayout } from "@/components/directorio-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import "@/styles/pages.css"
import { notFound } from "next/navigation"
import { DoorOpenIcon, BuildingIcon, CalendarCheckIcon, ClockIcon, MapPinIcon, AlertCircleIcon, UserRoundIcon as UserRoundMedical, ClipboardListIcon, ScissorsIcon } from 'lucide-react'
import { VideoAgendas } from "@/components/video-agendas"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, useParams } from "next/navigation"
import { useDoctorSchedule } from "@/hooks/use-doctor-schedule"

/**
 * Página de horarios de médico
 * Utiliza el hook useDoctorSchedule para separar la lógica de negocio de la presentación
 */
export default function SchedulePage() {
  const router = useRouter()
  const { doctor: doctorSlug, specialty: specialtySlug } = useParams<{ specialty: string; doctor: string }>()
  
  // Usar el hook personalizado para gestionar toda la lógica de negocio
  const {
    doctorInfo,
    doctorSchedules,
    selectedDay,
    selectedKind,
    loading,
    error,
    source,
    detailsRef,
    photoError,
    setPhotoError,
    availableDays,
    consultaDays,
    procedimientoDays,
    dayNames,
    isDaySelected,
    getBuildingDisplayName,
    isProcedure,
    isConsulta,
    setSelectedDay,
    setSelectedKind,
    reload
  } = useDoctorSchedule(doctorSlug, specialtySlug)

  // Estado de carga
  if (loading) {
    return (
      <DirectorioLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
            <div className="flex items-center space-x-4 w-full max-w-3xl">
              <Skeleton className="h-24 w-24 rounded-full bg-[#E5E5E5]" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-3/4 bg-[#E5E5E5]" />
                <Skeleton className="h-6 w-1/2 bg-[#E5E5E5]" />
              </div>
            </div>

            <div className="w-full max-w-4xl space-y-4">
              <Skeleton className="h-8 w-64 mx-auto bg-[#E5E5E5]" />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg bg-[#E5E5E5]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DirectorioLayout>
    )
  }

  // Estado de error
  if (error) {
    return (
      <DirectorioLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-[#F9F4F6] border border-[#7F0C43] rounded-lg p-6 text-center">
            <AlertCircleIcon className="mx-auto h-12 w-12 text-[#7F0C43] mb-4" />
            <h2 className="text-2xl font-bold text-[#7F0C43] mb-2" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Error al cargar los datos</h2>
            <p className="text-[#7F0C43] mb-6" style={{ fontFamily: "Arial, sans-serif" }}>{error}</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="destructive"
                onClick={reload}
                className="bg-[#7F0C43] hover:bg-[#C84D80] text-white"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                Reintentar
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="text-white hover:bg-[#C84D80]"
                style={{ fontFamily: "Arial, sans-serif", backgroundColor: '#8C3048' }}
              >
                Volver atrás
              </Button>
            </div>
          </div>
        </div>
      </DirectorioLayout>
    )
  }

  // Sin datos del médico
  if (!doctorInfo || !doctorSchedules) {
    notFound()
  }

  return (
    <DirectorioLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Sección de perfil del médico */}
        <div className="sticky top-32 z-30 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b rounded-xl shadow-sm p-6 border border-[#E5E5E5] mb-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#F9F4F6] overflow-hidden flex items-center justify-center">
              {doctorInfo.photo && !photoError ? (
                <img
                  src={doctorInfo.photo}
                  alt={`Foto del Dr. ${doctorInfo.name}`}
                  className="w-full h-full object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <UserRoundMedical className="w-16 h-16 md:w-20 md:h-20 text-[#7F0C43]" />
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#333333] mb-1" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Dr. {doctorInfo.name}</h1>
              
              {/* Mostrar especialidades según el origen */}
              <div className="mb-3">
                {source === 'specialty' ? (
                  // Desde búsqueda por especialidad: mostrar solo la especialidad seleccionada
                  <p className="text-lg text-[#7F0C43] font-medium" style={{ fontFamily: "'Century Gothic', sans-serif" }}>
                    {doctorInfo.specialty}
                  </p>
                ) : (
                  // Desde búsqueda por médico: mostrar todas las especialidades
                  doctorInfo.especialidades && doctorInfo.especialidades.length > 0 ? (
                    <div className="space-y-1">
                      {doctorInfo.especialidades.map((esp, index) => (
                        <p 
                          key={`${esp.id}-${index}`}
                          className="text-lg text-[#7F0C43] font-medium" 
                          style={{ fontFamily: "'Century Gothic', sans-serif" }}
                        >
                          {esp.label}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg text-[#7F0C43] font-medium" style={{ fontFamily: "'Century Gothic', sans-serif" }}>
                      {doctorInfo.specialty}
                    </p>
                  )
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {availableDays.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F9F4F6] text-[#7F0C43] text-sm font-medium border border-[#C84D80]" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CalendarCheckIcon className="h-4 w-4 mr-1" />
                    {availableDays.length} día{availableDays.length !== 1 ? 's' : ''} disponible{availableDays.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de horarios */}
        <section className="mb-12 flex flex-col items-center">
          <h1 className="doctor-schedule-title">Horarios de atención</h1>

          {availableDays.length === 0 && (
            <div className="no-schedule-message w-full max-w-2xl mx-auto">
              <Card className="no-schedule-card border border-[#E5E5E5] shadow-lg">
                <CardHeader>
                  <CardTitle className="no-schedule-title text-2xl font-bold text-[#7F0C43] text-center" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Sin horarios disponibles</CardTitle>
                </CardHeader>
                <CardContent className="no-schedule-content text-center">
                  <AlertCircleIcon className="mx-auto h-12 w-12 text-[#7F0C43] mb-4" />
                  <p className="text-[#333333] mb-4" style={{ fontFamily: "Arial, sans-serif" }}>El Dr. {doctorInfo.name} no tiene horarios de consulta programados actualmente.</p>
                  <p className="text-[#666666]" style={{ fontFamily: "Arial, sans-serif" }}>Por favor, contacta directamente con información o regresa más tarde.</p>
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="text-white hover:bg-[#C84D80]"
                      style={{ fontFamily: "Arial, sans-serif", backgroundColor: '#8C3048' }}
                    >
                      Volver atrás
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="w-full max-w-6xl mx-auto">
            {/* Layout horizontal para las cards de consulta y procedimiento */}
            <div className={`flex gap-6 ${
              consultaDays.length > 0 && procedimientoDays.length > 0 
                ? 'flex-row' 
                : 'flex-row justify-center'
            }`}>
            {/* Días de Consulta */}
            {consultaDays.length > 0 && (
                <div className="consultation-days-section flex-1" style={{
                  background: 'transparent',
                  borderRadius: '25px',
                  padding: '16px',
                  border: '1px solid rgba(127, 12, 67, 0.1)',
                  boxShadow: '0 8px 32px rgba(127, 12, 67, 0.08)'
                }}>
                  <div className="consultation-days-header" style={{ marginBottom: '24px', background: 'transparent' }}>
                    <div className="flex items-center justify-center gap-3" style={{ marginBottom: '8px' }}>
                      <div style={{
                        backgroundColor: '#7F0C43',
                        borderRadius: '12px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ClipboardListIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#7F0C43]" style={{ 
                        fontFamily: "'Century Gothic', sans-serif",
                        textAlign: 'center'
                      }}>
                      Días de Consulta
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-center items-center">
                    {consultaDays.map((day) => {
                      const isSelected = isDaySelected(day, 'consulta')
                      return (
                        <div
                          key={day}
                          onClick={() => { setSelectedDay(day); setSelectedKind('consulta') }}
                          className="consultation-day-card flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
                          style={{
                            backgroundColor: isSelected ? '#7F0C43' : 'white',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            border: isSelected ? '2px solid #7F0C43' : '2px solid rgba(127, 12, 67, 0.2)',
                            boxShadow: isSelected 
                              ? '0 8px 24px rgba(127, 12, 67, 0.3)' 
                              : '0 4px 16px rgba(127, 12, 67, 0.1)',
                            transform: isSelected ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                            minWidth: '120px',
                            minHeight: '80px'
                          }}
                        >
                          <h4 className={`font-bold transition-all duration-300 ${
                            isSelected ? 'text-white text-lg' : 'text-[#7F0C43] text-base'
                          }`} style={{ fontFamily: "'Century Gothic', sans-serif" }}>
                            {dayNames[day]}
                          </h4>
                          </div>
                      )
                    })}
                  </div>
                </div>
            )}

            {/* Días de Procedimiento */}
            {procedimientoDays.length > 0 && (
                <div className="procedure-days-section flex-1" style={{
                  background: 'transparent',
                  borderRadius: '25px',
                  padding: '16px',
                  border: '1px solid rgba(127, 12, 67, 0.1)',
                  boxShadow: '0 8px 32px rgba(127, 12, 67, 0.08)'
                }}>
                  <div className="procedure-days-header" style={{ marginBottom: '24px', background: 'transparent' }}>
                    <div className="flex items-center justify-center gap-3" style={{ marginBottom: '8px' }}>
                      <div style={{
                        backgroundColor: '#7F0C43',
                        borderRadius: '12px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ScissorsIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#7F0C43]" style={{ 
                        fontFamily: "'Century Gothic', sans-serif",
                        textAlign: 'center'
                      }}>
                      Días de Procedimiento
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-center items-center">
                    {procedimientoDays.map((day) => {
                      const isSelected = isDaySelected(day, 'procedimiento')
                      return (
                        <div
                          key={day}
                          onClick={() => { setSelectedDay(day); setSelectedKind('procedimiento') }}
                          className="procedure-day-card flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
                          style={{
                            backgroundColor: isSelected ? '#7F0C43' : 'white',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            border: isSelected ? '2px solid #7F0C43' : '2px solid rgba(127, 12, 67, 0.2)',
                            boxShadow: isSelected 
                              ? '0 8px 24px rgba(127, 12, 67, 0.3)' 
                              : '0 4px 16px rgba(127, 12, 67, 0.1)',
                            transform: isSelected ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                            minWidth: '120px',
                            minHeight: '80px'
                          }}
                        >
                          <h4 className={`font-bold transition-all duration-300 ${
                            isSelected ? 'text-white text-lg' : 'text-[#7F0C43] text-base'
                          }`} style={{ fontFamily: "'Century Gothic', sans-serif" }}>
                            {dayNames[day]}
                          </h4>
                          </div>
                      )
                    })}
                  </div>
                </div>
            )}
            </div>
          </div>
        </section>

        {/* Detalles del día seleccionado */}
        <div ref={detailsRef} />
        {selectedDay && doctorSchedules?.[selectedDay] && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-[#7F0C43] mb-6 text-center" style={{ fontFamily: "'Century Gothic', sans-serif" }}>
              Detalles día {dayNames[selectedDay]}
            </h2>
            
            <div className="w-full max-w-4xl mx-auto space-y-3">
              {(doctorSchedules[selectedDay] || [])
                .filter(sched => {
                  if (!selectedKind) return true
                  return selectedKind === 'consulta' ? isConsulta(sched.tipo) : isProcedure(sched.tipo)
                })
                .map((sched, idx) => (
                  <Card key={idx} className="doctor-schedule-details-card w-full mx-auto border border-[#E5E5E5] shadow-sm">
                    <CardHeader className="doctor-schedule-details-header">
                      <CardTitle className="doctor-schedule-details-title text-xl font-bold text-[#7F0C43] text-center" style={{ fontFamily: "'Century Gothic', sans-serif" }}>
                        {sched.tipo || 'Horario'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="doctor-schedule-details-content">
                      <div className="space-y-2">
                          {source !== 'specialty' && sched.specialtyLabel && (
                          <div className="flex items-center gap-2">
                            <ClipboardListIcon className="doctor-schedule-details-icon h-5 w-5 text-[#7F0C43]" />
                            <span className="doctor-schedule-details-label font-medium">Especialidad:</span>
                            <span className="text-2xl">{sched.specialtyLabel}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <CalendarCheckIcon className="doctor-schedule-details-icon h-5 w-5 text-[#7F0C43]" />
                          <span className="doctor-schedule-details-label font-medium">Horario:</span>
                          <span className="text-2xl">{sched.time}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DoorOpenIcon className="doctor-schedule-details-icon h-5 w-5 text-[#7F0C43]" />
                          <span className="doctor-schedule-details-label font-medium">Consultorio:</span>
                          <span className="text-2xl">{sched.room}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <BuildingIcon className="doctor-schedule-details-icon h-5 w-5 text-[#7F0C43]" />
                          <span className="doctor-schedule-details-label font-medium">Edificio:</span>
                          <span className="text-2xl">{getBuildingDisplayName(sched.building)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="doctor-schedule-details-icon h-5 w-5 text-[#7F0C43]" />
                          <span className="doctor-schedule-details-label font-medium">Ubicación:</span>
                          <span className="text-2xl">{sched.floor || 'No especificado'}</span>
                        </div>
      
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Video de agendas */}
            <div className="w-full max-w-3xl mx-auto mt-8">
              <VideoAgendas
                consultorio={((doctorSchedules[selectedDay] || [])
                  .filter(sched => {
                    if (!selectedKind) return true
                    return selectedKind === 'consulta' ? isConsulta(sched.tipo) : isProcedure(sched.tipo)
                  })[0])?.room}
                building={getBuildingDisplayName(((doctorSchedules[selectedDay] || [])
                  .filter(sched => {
                    if (!selectedKind) return true
                    return selectedKind === 'consulta' ? isConsulta(sched.tipo) : isProcedure(sched.tipo)
                  })[0])?.building)}
                floor={((doctorSchedules[selectedDay] || [])
                  .filter(sched => {
                    if (!selectedKind) return true
                    return selectedKind === 'consulta' ? isConsulta(sched.tipo) : isProcedure(sched.tipo)
                  })[0])?.floor}
              />
            </div>
          </div>
        )}

        {selectedDay && !doctorSchedules?.[selectedDay] && (
          <Card className="doctor-schedule-empty-card">
            <CardTitle className="doctor-schedule-empty-title">¡Atención!</CardTitle>
            <p className="doctor-schedule-empty-text">
              El Dr. {doctorInfo.name} no tiene horario disponible para el <b>{dayNames[selectedDay]}</b>.
            </p>
            <p className="doctor-schedule-empty-subtext">
              Por favor, selecciona otro día o regresa a la lista de doctores.
            </p>
          </Card>
        )}
      </div>
    </DirectorioLayout>
  )
}