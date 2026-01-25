import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useRegisterForEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId?: string }) => {
      return tuyau
        .$route('api.v1.events.participants.register', { id: eventId })
        .$post({ userId })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-participants', { eventId: variables.eventId }],
      })
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] })
    },
  })
}

export function useUpdateParticipantStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      participantId,
      status,
    }: {
      eventId: string
      participantId: string
      status: 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED'
    }) => {
      return tuyau
        .$route('api.v1.events.participants.updateStatus', { id: eventId, participantId })
        .$put({ status })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-participants', { eventId: variables.eventId }],
      })
    },
  })
}

export function useCancelEventRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, participantId }: { eventId: string; participantId: string }) => {
      return tuyau
        .$route('api.v1.events.participants.cancel', { id: eventId, participantId })
        .$delete({})
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-participants', { eventId: variables.eventId }],
      })
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] })
    },
  })
}

export function useConfirmEventAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, participantId }: { eventId: string; participantId: string }) => {
      return tuyau
        .$route('api.v1.events.participants.confirmAttendance', { id: eventId, participantId })
        .$post({})
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-participants', { eventId: variables.eventId }],
      })
    },
  })
}
