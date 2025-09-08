import * as React from "react"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"

export function CalendarBR(props: CalendarProps) {
  return <Calendar locale={ptBR} {...props} />
}