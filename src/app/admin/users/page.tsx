'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { FiSearch } from 'react-icons/fi'

type User = {
  id: string
  prenom: string
  nom: string
  email: string
  role: string
  filiere?: string
  createdAt: string
  _count: { orders: number }
}

const ROLES = ['CLIENT', 'GRAPHISTE', 'ADMIN'] as const

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    const res = await fetch(`/api/users?${params}`)
    const data = await res.json()
    setUsers(data.users || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const changeRole = async (userId: string, role: string) => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    if (res.ok) {
      toast.success('Rôle mis à jour')
      fetchUsers()
    } else {
      toast.error('Erreur')
    }
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0d1b3e' }}>Utilisateurs</h1>
        <p className="text-sm text-slate-500 mt-1">{total} utilisateur{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <FiSearch size={14} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="text-sm outline-none bg-transparent flex-1 text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 text-slate-600"
        >
          <option value="">Tous rôles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-12 bg-white rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nom</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Filière</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Commandes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: '#0d1b3e' }}>{user.prenom} {user.nom}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-sm">{user.email}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-sm">{user.filiere || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-sm">{user._count.orders}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400 text-slate-600"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
