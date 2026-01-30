import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useRegisterForEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, participantId, parentalConsent }: { eventId: string; participantId: string; parentalConsent?: boolean }) => {
      return tuyau
        .$route('api.v1.events.participants.register', { eventId })
        .$post({ participantId, parentalConsent })
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
        .$route('api.v1.events.participants.updateStatus', { eventId, participantId })
        .$put({ status } as any)
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
        .$route('api.v1.events.participants.cancel', { eventId, participantId })
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
        .$route('api.v1.events.participants.confirmAttendance', { eventId, participantId })
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
