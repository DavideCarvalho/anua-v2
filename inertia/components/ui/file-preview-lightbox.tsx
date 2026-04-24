import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, X } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent } from '~/components/ui/dialog'

export type PreviewFile = {
  id: string
  fileName: string
  fileUrl?: string | null
  mimeType?: string | null
}

type FilePreviewLightboxProps = {
  files: PreviewFile[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getRendererType(file: PreviewFile): 'image' | 'pdf' | 'unsupported' | 'unavailable' {
  if (!file.fileUrl) {
    return 'unavailable'
  }

  const mime = file.mimeType?.toLowerCase() ?? ''
  const extension = file.fileName.split('.').pop()?.toLowerCase() ?? ''

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
    return 'image'
  }

  if (mime === 'application/pdf' || extension === 'pdf') {
    return 'pdf'
  }

  return 'unsupported'
}

function downloadFile(file: PreviewFile) {
  if (!file.fileUrl) {
    return
  }

  const link = document.createElement('a')
  link.href = file.fileUrl
  link.download = file.fileName
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function FilePreviewLightbox({ files, initialIndex, open, onOpenChange }: FilePreviewLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const hasFiles = files.length > 0

  useEffect(() => {
    if (!open) {
      return
    }

    if (!hasFiles) {
      setCurrentIndex(0)
      return
    }

    const safeIndex = Math.max(0, Math.min(initialIndex, files.length - 1))
    setCurrentIndex(safeIndex)
  }, [files.length, hasFiles, initialIndex, open])

  const currentFile = files[currentIndex]
  const renderer = useMemo(() => {
    if (!currentFile) {
      return 'unavailable' as const
    }

    return getRendererType(currentFile)
  }, [currentFile])

  const showPrevious = files.length > 1
  const showNext = files.length > 1

  const handlePrevious = useCallback(() => {
    if (files.length <= 1) {
      return
    }

    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length)
  }, [files.length])

  const handleNext = useCallback(() => {
    if (files.length <= 1) {
      return
    }

    setCurrentIndex((prev) => (prev + 1) % files.length)
  }, [files.length])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }

      if (event.key === 'ArrowLeft') {
        handlePrevious()
      }

      if (event.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleNext, handlePrevious, onOpenChange, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-black/95 p-0 text-white sm:max-w-none"
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentFile?.fileName ?? 'Arquivo'}</p>
              <p className="text-xs text-white/70">
                {files.length > 0 ? `${currentIndex + 1}/${files.length}` : '0/0'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={handlePrevious}
                disabled={!showPrevious}
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={handleNext}
                disabled={!showNext}
              >
                <ChevronRight />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => currentFile && downloadFile(currentFile)}
                disabled={!currentFile?.fileUrl}
              >
                <Download />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => onOpenChange(false)}
              >
                <X />
              </Button>
            </div>
          </header>

          <main className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6">
            {renderer === 'image' && currentFile?.fileUrl && (
              <img
                src={currentFile.fileUrl}
                alt={currentFile.fileName}
                className="max-h-full max-w-full object-contain"
              />
            )}

            {renderer === 'pdf' && currentFile?.fileUrl && (
              <iframe
                src={currentFile.fileUrl}
                title={currentFile.fileName}
                className="h-full w-full rounded-md border border-white/10 bg-white"
              />
            )}

            {(renderer === 'unsupported' || renderer === 'unavailable') && (
              <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                <FileText className="h-8 w-8 text-white/80" />
                <p className="text-sm font-medium">Pré-visualização indisponível para este arquivo</p>
                <p className="text-xs text-white/70">
                  {renderer === 'unavailable'
                    ? 'Este anexo não possui URL disponível no momento.'
                    : 'Abra em nova aba ou baixe para visualizar.'}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    asChild
                    disabled={!currentFile?.fileUrl}
                  >
                    <a href={currentFile?.fileUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Abrir em nova aba
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={() => currentFile && downloadFile(currentFile)}
                    disabled={!currentFile?.fileUrl}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Baixar
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
