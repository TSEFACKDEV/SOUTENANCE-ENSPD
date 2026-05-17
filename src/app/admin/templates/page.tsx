'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { FiPlus, FiTrash2, FiImage } from 'react-icons/fi'
import { FILIERES } from '@/types'

type Template = {
  id: string
  name: string
  filiere: string
  previewUrl: string
  isActive: boolean
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [filiere, setFiliere] = useState('GI')
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchTemplates = async () => {
    setLoading(true)
    const res = await fetch('/api/services')
    const data = await res.json()
    setTemplates(data.templates || [])
    setLoading(false)
  }

  useEffect(() => { fetchTemplates() }, [])

  const addTemplate = async () => {
    if (!name || !previewUrl) { toast.error('Nom et URL de prévisualisation requis'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, filiere, previewUrl, isActive: true, sourceFileUrl: '' }),
      })
      if (res.ok) {
        toast.success('Template ajouté')
        setShowForm(false)
        setName('')
        setPreviewUrl('')
        fetchTemplates()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erreur')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>Templates flyer</h1>
          <p className="text-sm text-slate-500 mt-1">Gérer les templates disponibles</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
        >
          <FiPlus size={14} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-5 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 className="font-extrabold text-sm" style={{ color: '#0d1b3e' }}>Nouveau template</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" placeholder="Ex: Template GI Standard" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Filière *</label>
              <select value={filiere} onChange={(e) => setFiliere(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-slate-50 text-slate-700">
                {FILIERES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">URL de prévisualisation *</label>
            <input value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
          </div>
          <div className="flex gap-2">
            <button onClick={addTemplate} disabled={saving}
              className="text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-400 hover:text-slate-700 px-4 py-2 font-medium">Annuler</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl py-16 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <FiImage size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Aucun template</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <img src={t.previewUrl} alt={t.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <p className="text-sm font-extrabold" style={{ color: '#0d1b3e' }}>{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.filiere}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
