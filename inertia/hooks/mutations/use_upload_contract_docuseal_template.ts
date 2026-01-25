import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.contracts.uploadDocusealTemplate')

type UploadBody = Parameters<typeof $route.$post>[0]

type UploadParams = {
  contractId: string
  body: UploadBody
}

export function useUploadContractDocusealTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, body }: UploadParams) => {
      return tuyau
        .$route('api.v1.contracts.uploadDocusealTemplate', { contractId })
        .$post(body)
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contracts', 'docuseal-template', { contractId: variables.contractId }],
      })
    },
  })
}
