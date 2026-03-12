import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { fadeIn, transition } from '~/components/animations'
import { useCalendar } from '~/components/calendar-context'
import { AddEditEventDialog } from '~/components/add-edit-event-dialog'
import { DroppableArea } from '~/components/droppable-area'
import { groupEvents } from '~/components/helpers'
import type { IEvent } from '~/components/interfaces'
import { CalendarTimeline } from '~/components/calendar-time-line'
import { RenderGroupedEvents } from '~/components/render-grouped-events'
import { WeekViewMultiDayEventsRow } from '~/components/week-view-multi-day-events-row'

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
  onEmptyDayAction?: (date: Date, action: 'assignment' | 'exam' | 'event') => void
}

function slotDate(day: Date, hour: number, minute: number) {
  const nextDate = new Date(day)
  nextDate.setHours(hour, minute, 0, 0)
  return nextDate
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents, onEmptyDayAction }: IProps) {
  const { selectedDate, use24HourFormat } = useCalendar()
  const [openSlotKey, setOpenSlotKey] = useState<string | null>(null)

  const weekStart = startOfWeek(selectedDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      transition={transition}
    >
      <div className="flex flex-col items-center justify-center border-b p-4 text-sm sm:hidden">
        <p>A visualização semanal não é recomendada em telas menores.</p>
        <p>Use um dispositivo maior ou mude para a visualização diária.</p>
      </div>

      <div className="flex-col sm:flex">
        <div>
          <WeekViewMultiDayEventsRow selectedDate={selectedDate} multiDayEvents={multiDayEvents} />

          {/* Week header */}
          <div className="relative z-20 flex border-b">
            {/* Time column header - responsive width */}
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-7  border-l">
              {weekDays.map((day) => (
                <span
                  key={day.toISOString()}
                  className="py-1 sm:py-2 text-center text-xs font-medium text-t-quaternary"
                >
                  {/* Mobile: Show only day abbreviation and number */}
                  <span className="block sm:hidden">
                    {format(day, 'EEE').charAt(0)}
                    <span className="block font-semibold text-t-secondary text-xs">
                      {format(day, 'd')}
                    </span>
                  </span>
                  {/* Desktop: Show full format */}
                  <span className="hidden sm:inline">
                    {format(day, 'EE')}{' '}
                    <span className="ml-1 font-semibold text-t-secondary">{format(day, 'd')}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[736px]">
          <div className="flex">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: '96px' }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-t-quaternary">
                        {format(
                          new Date().setHours(hour, 0, 0, 0),
                          use24HourFormat ? 'HH:00' : 'h a'
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day) => {
                  const dayEvents = singleDayEvents.filter(
                    (event) =>
                      isSameDay(parseISO(event.startDate), day) ||
                      isSameDay(parseISO(event.endDate), day)
                  )
                  const groupedEvents = groupEvents(dayEvents)

                  return (
                    <div key={day.toISOString()} className="relative overflow-hidden">
                      {hours.map((hour, index) => (
                        <div key={hour} className="relative" style={{ height: '96px' }}>
                          {index !== 0 && (
                            <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
                          )}

                          <DroppableArea
                            date={day}
                            hour={hour}
                            minute={0}
                            className="group/slot absolute inset-x-0 top-0 h-[48px]"
                          >
                            {onEmptyDayAction ? (
                              <div className="absolute inset-0">
                                <Popover
                                  open={openSlotKey === `${day.toISOString()}-${hour}-0`}
                                  onOpenChange={(open) =>
                                    setOpenSlotKey(open ? `${day.toISOString()}-${hour}-0` : null)
                                  }
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1 z-10 h-6 w-6 rounded-sm border bg-background/90 opacity-0 transition-opacity group-hover/slot:opacity-100"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent align="end" className="w-44 p-1.5">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-8 w-full justify-start"
                                      onClick={() => {
                                        setOpenSlotKey(null)
                                        onEmptyDayAction(slotDate(day, hour, 0), 'assignment')
                                      }}
                                    >
                                      Nova atividade
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-8 w-full justify-start"
                                      onClick={() => {
                                        setOpenSlotKey(null)
                                        onEmptyDayAction(slotDate(day, hour, 0), 'exam')
                                      }}
                                    >
                                      Nova prova
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-8 w-full justify-start"
                                      onClick={() => {
                                        setOpenSlotKey(null)
                                        onEmptyDayAction(slotDate(day, hour, 0), 'event')
                                      }}
                                    >
                                      Novo evento
                                    </Button>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            ) : (
                              <AddEditEventDialog startDate={day} startTime={{ hour, minute: 0 }}>
                                <div className="absolute inset-0 cursor-pointer transition-colors hover:bg-secondary" />
                              </AddEditEventDialog>
                            )}
                          </DroppableArea>

                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed border-b-tertiary"></div>

                          <DroppableArea
                            date={day}
                            hour={hour}
                            minute={30}
                            className="group/slot absolute inset-x-0 bottom-0 h-[48px]"
                          >
                            {onEmptyDayAction ? (
                              <div className="absolute inset-0">
                                <Popover
                                  open={openSlotKey === `${day.toISOString()}-${hour}-30`}
                                  onOpenChange={(open) =>
                                    setOpenSlotKey(open ? `${day.toISOString()}-${hour}-30` : null)
                                  }
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1 z-10 h-6 w-6 rounded-sm border bg-background/90 opacity-0 transition-opacity group-hover/slot:opacity-100"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent align="end" className="w-44 p-1.5">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-8 w-full justify-start"
                                      onClick={() => {
                                        setOpenSlotKey(null)
                                        onEmptyDayAction(slotDate(day, hour, 30), 'assignment')
                                      }}
                                    >
                                      Nova atividade
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-8 w-full justify-start"
                                      onClick={() => {
                                        setOpenSlotKey(null)
                                        onEmptyDayAction(slotDate(day, hour, 30), 'exam')
                                      }}
                                    >
                                      Nova prova
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-8 w-full justify-start"
                                      onClick={() => {
                                        setOpenSlotKey(null)
                                        onEmptyDayAction(slotDate(day, hour, 30), 'event')
                                      }}
                                    >
                                      Novo evento
                                    </Button>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            ) : (
                              <AddEditEventDialog startDate={day} startTime={{ hour, minute: 30 }}>
                                <div className="absolute inset-0 cursor-pointer transition-colors hover:bg-secondary" />
                              </AddEditEventDialog>
                            )}
                          </DroppableArea>
                        </div>
                      ))}

                      <RenderGroupedEvents groupedEvents={groupedEvents} day={day} />
                    </div>
                  )
                })}
              </div>

              <CalendarTimeline />
            </div>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  )
}
