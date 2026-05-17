'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { FiUpload, FiFile, FiX, FiDownload } from 'react-icons/fi'

// ─── Single File Upload ────────────────────────────────────────────────────

interface FileUploadProps {
  label: string
  accept: string
  onUpload: (url: string) => void
  currentUrl?: string
  required?: boolean
  hint?: string
  showPreview?: boolean
}

export function FileUpload({
  label,
  accept,
  onUpload,
  currentUrl,
  required,
  hint,
  showPreview = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || '')
  const [filename, setFilename] = useState('')

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur upload')
        return
      }
      const data = await res.json()
      setUploadedUrl(data.url)
      setFilename(file.name)
      onUpload(data.url)
      toast.success('Fichier uploadé avec succès')
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => {
    setUploadedUrl('')
    setFilename('')
    onUpload('')
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-800 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {uploadedUrl ? (
        <div className="border border-green-200 bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          {showPreview && isImage(uploadedUrl) ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedUrl}
                alt="aperçu"
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-green-200"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {filename || 'Photo uploadée'}
                </p>
                <p className="text-xs text-green-600">✓ Image prête</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <FiFile size={18} className="text-green-700" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {filename || 'Fichier uploadé'}
                </p>
                <p className="text-xs text-green-600">✓ Uploadé avec succès</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-slate-500 hover:text-primary underline"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={clear}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-colors ${
            uploading
              ? 'border-slate-200 bg-slate-50 cursor-wait'
              : 'border-slate-300 hover:border-primary hover:bg-blue-50 cursor-pointer'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-slate-500">Upload en cours...</span>
            </>
          ) : (
            <>
              <FiUpload size={20} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                Cliquer pour sélectionner un fichier
              </span>
              {hint && (
                <span className="text-xs text-slate-400 text-center">{hint}</span>
              )}
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

// ─── Multi File Upload ─────────────────────────────────────────────────────

interface MultiFileUploadProps {
  label: string
  accept: string
  onUpload: (urls: string[]) => void
  currentUrls?: string[]
  hint?: string
}

export function MultiFileUpload({
  label,
  accept,
  onUpload,
  currentUrls = [],
  hint,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<{ url: string; name: string }[]>(
    currentUrls.map((url) => ({ url, name: url.split('/').pop() || 'Fichier' }))
  )

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Erreur upload')
        return
      }
      const data = await res.json()
      const newFiles = [...files, { url: data.url, name: file.name }]
      setFiles(newFiles)
      onUpload(newFiles.map((f) => f.url))
      toast.success(`${file.name} uploadé`)
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onUpload(newFiles.map((f) => f.url))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-800 mb-1.5">{label}</label>

      {files.length > 0 && (
        <div className="space-y-2 mb-3">
          {files.map((f, i) => (
            <div
              key={i}
              className="border border-green-200 bg-green-50 rounded-xl px-3 py-2.5 flex items-center gap-3"
            >
              {isImage(f.url) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={f.url}
                  alt={f.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <FiFile size={14} className="text-green-700" />
                </div>
              )}
              <span className="text-sm text-green-800 flex-1 truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-slate-400 hover:text-red-500 shrink-0 transition-colors"
                title="Supprimer"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`w-full border-2 border-dashed rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-colors ${
          uploading
            ? 'border-slate-200 bg-slate-50 cursor-wait'
            : 'border-slate-300 hover:border-primary hover:bg-blue-50 cursor-pointer'
        }`}
      >
        {uploading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-slate-500">Upload en cours...</span>
          </>
        ) : (
          <>
            <FiUpload size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {files.length > 0 ? 'Ajouter un autre fichier' : 'Sélectionner des fichiers'}
            </span>
          </>
        )}
      </button>

      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

// ─── File Download Link (for display) ─────────────────────────────────────

interface FileDownloadProps {
  url: string
  label: string
  className?: string
}

export function FileDownloadLink({ url, label, className = '' }: FileDownloadProps) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
  const filename = url.split('/').pop() || label

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {isImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt={label}
          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
        />
      ) : (
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
          <FiFile size={16} className="text-slate-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{filename}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <a
        href={url}
        download
        className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-xl shrink-0"
        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
      >
        <FiDownload size={12} /> Télécharger
      </a>
    </div>
  )
}
