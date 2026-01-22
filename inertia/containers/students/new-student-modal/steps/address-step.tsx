import { useFormContext } from 'react-hook-form'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import type { NewStudentFormData } from '../schema'

export function AddressStep() {
  const form = useFormContext<NewStudentFormData>()
  const [isCepLoading, setIsCepLoading] = useState(false)
  const numberInputRef = useRef<HTMLInputElement | null>(null)

  async function fetchAddressByCep(cep: string) {
    if (cep.length !== 8) return

    setIsCepLoading(true)
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`)
      const data = await response.json()

      if (response.ok) {
        form.setValue('address.street', data.street)
        form.setValue('address.neighborhood', data.neighborhood)
        form.setValue('address.city', data.city)
        form.setValue('address.state', data.state)
        numberInputRef.current?.focus()
      } else {
        toast.error('CEP não encontrado')
      }
    } catch (_error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setIsCepLoading(false)
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <FormField
        control={form.control}
        name="address.zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP*</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input
                  {...field}
                  disabled={isCepLoading}
                  maxLength={8}
                  placeholder="Somente números"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    field.onChange(value)

                    if (value.length === 8) {
                      fetchAddressByCep(value)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCepLoading || field.value?.length !== 8}
                  onClick={() => field.value && fetchAddressByCep(field.value)}
                >
                  {isCepLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address.street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rua*</FormLabel>
            <FormControl>
              <Input {...field} disabled={isCepLoading} placeholder="Rua, Avenida, etc." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="address.number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número*</FormLabel>
              <FormControl>
                <Input {...field} ref={numberInputRef} placeholder="Número" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address.complement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Apt, Bloco, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address.neighborhood"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro*</FormLabel>
            <FormControl>
              <Input {...field} disabled={isCepLoading} placeholder="Bairro" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="address.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade*</FormLabel>
              <FormControl>
                <Input {...field} disabled={isCepLoading} placeholder="Cidade" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado*</FormLabel>
              <FormControl>
                <Input {...field} disabled={isCepLoading} maxLength={2} placeholder="UF" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
