interface SelectOption {
  value: string
  label: string
}

export function resolveSelectValueLabel(value: string | undefined, options: SelectOption[]) {
  if (!value) return ''

  const option = options.find((item) => item.value === value)
  return option?.label ?? value
}
