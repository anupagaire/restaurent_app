'use client'

import { useState, useEffect } from 'react'
import { Globe, CheckCircle2, Clock, XCircle, RefreshCw, Search, ExternalLink, Trash2, Shield } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : ''
}

interface DomainEntry {
  restaurant_id: number
  restaurant_name: string
  custom_domain: string | null
  custom_domain_verified: boolean
  custom_domain_verified_at: string | null
  verification_txt_name: string | null
  verification_txt_value: string | null
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(options?.headers ?? {}),
    },
  })
  if (res.status === 204) return { ok: true, status: 204 }
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

function StatusBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      <CheckCircle2 size={11} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
      <Clock size={11} /> Pending
    </span>
  )
}

export default function CustomDomainsPage() {
  const [restaurants, setRestaurants] = useState<DomainEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'none'>('all')
  const [verifying, setVerifying] = useState<number | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const load = async () => {
    setLoading(true)
    try {
      // Fetch all restaurants
      const res = await apiFetch('/api/v1/restaurant/?page_size=1000&status=true')
      if (!res.ok) { setLoading(false); return }
      const list = res.data?.results ?? res.data ?? []

      // For each restaurant, fetch their custom domain status
      const entries: DomainEntry[] = await Promise.all(
        list.map(async (r: any) => {
          try {
            const domainRes = await apiFetch(`/api/v1/restaurant/custom-domain/`)
            if (domainRes.ok && domainRes.data?.custom_domain) {
              return {
                restaurant_id: r.id,
                restaurant_name: r.name,
                custom_domain: domainRes.data.custom_domain,
                custom_domain_verified: domainRes.data.custom_domain_verified,
                custom_domain_verified_at: domainRes.data.custom_domain_verified_at,
                verification_txt_name: domainRes.data.verification_txt_name,
                verification_txt_value: domainRes.data.verification_txt_value,
              }
            }
          } catch {}
          return {
            restaurant_id: r.id,
            restaurant_name: r.name,
            custom_domain: null,
            custom_domain_verified: false,
            custom_domain_verified_at: null,
            verification_txt_name: null,
            verification_txt_value: null,
          }
        })
      )
      setRestaurants(entries)
    } catch (e) {
      showMsg('error', 'Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleVerify = async (entry: DomainEntry) => {
    if (!entry.custom_domain) return
    setVerifying(entry.restaurant_id)
    try {
      // Try confirm/ endpoint — super admin verifying on behalf
      const res = await apiFetch(`/api/v1/restaurant/custom-domain/confirm/`, {
        method: 'POST',
        body: JSON.stringify({ custom_domain: entry.custom_domain }),
      })
      if (res.ok && res.data?.custom_domain_verified) {
        showMsg('success', `✅ ${entry.restaurant_name}'s domain verified!`)
        setRestaurants(prev => prev.map(r =>
          r.restaurant_id === entry.restaurant_id
            ? { ...r, custom_domain_verified: true, custom_domain_verified_at: new Date().toISOString() }
            : r
        ))
      } else {
        const errMsg = res.data?.errors?.txt_record ?? res.data?.message ?? 'DNS TXT record not found yet'
        showMsg('error', `❌ ${errMsg}`)
      }
    } catch {
      showMsg('error', 'Verification failed')
    } finally {
      setVerifying(null)
    }
  }

  const handleRemove = async (entry: DomainEntry) => {
    if (!confirm(`Remove domain "${entry.custom_domain}" from ${entry.restaurant_name}?`)) return
    setRemoving(entry.restaurant_id)
    try {
      const res = await apiFetch(`/api/v1/restaurant/custom-domain/`, { method: 'DELETE' })
      if (res.ok) {
        showMsg('success', `Domain removed from ${entry.restaurant_name}`)
        setRestaurants(prev => prev.map(r =>
          r.restaurant_id === entry.restaurant_id
            ? { ...r, custom_domain: null, custom_domain_verified: false }
            : r
        ))
      } else {
        showMsg('error', 'Failed to remove domain')
      }
    } catch {
      showMsg('error', 'Network error')
    } finally {
      setRemoving(null)
    }
  }

  // Filter + search
  const filtered = restaurants.filter(r => {
    const matchSearch = r.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.custom_domain ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'verified' ? r.custom_domain_verified :
      filter === 'pending' ? (!!r.custom_domain && !r.custom_domain_verified) :
      filter === 'none' ? !r.custom_domain : true
    return matchSearch && matchFilter
  })

  const stats = {
    total: restaurants.filter(r => r.custom_domain).length,
    verified: restaurants.filter(r => r.custom_domain_verified).length,
    pending: restaurants.filter(r => r.custom_domain && !r.custom_domain_verified).length,
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe size={24} className="text-orange-500" />
            Custom Domains
          </h1>
          <p className="text-secondary text-sm mt-1">
            Manage enterprise custom domains for all restaurants
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          msg.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-100'
            : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Domains', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Verified', value: stats.verified, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Pending DNS', value: stats.pending, color: 'text-yellow-700', bg: 'bg-yellow-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-white`}>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-secondary mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search restaurant or domain..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'pending', 'none'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'none' ? 'No Domain' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw size={24} className="animate-spin text-orange-400 mx-auto mb-3" />
            <p className="text-secondary text-sm">Loading restaurants...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Globe size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-secondary text-sm">No results found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Restaurant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Custom Domain</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Verified At</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(entry => (
                <>
                  <tr
                    key={entry.restaurant_id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === entry.restaurant_id ? null : entry.restaurant_id)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 text-sm">{entry.restaurant_name}</div>
                      <div className="text-xs text-secondary">ID: {entry.restaurant_id}</div>
                    </td>
                    <td className="px-5 py-4">
                      {entry.custom_domain ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-700">{entry.custom_domain}</span>
                          {entry.custom_domain_verified && (
                            <a
                              href={`https://${entry.custom_domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-orange-400 hover:text-orange-600"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-secondary italic">No domain set</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {entry.custom_domain
                        ? <StatusBadge verified={entry.custom_domain_verified} />
                        : <span className="text-xs text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-xs text-secondary">
                      {entry.custom_domain_verified_at
                        ? new Date(entry.custom_domain_verified_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {/* Verify button — only for pending */}
                        {entry.custom_domain && !entry.custom_domain_verified && (
                          <button
                            onClick={() => handleVerify(entry)}
                            disabled={verifying === entry.restaurant_id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                          >
                            {verifying === entry.restaurant_id
                              ? <RefreshCw size={11} className="animate-spin" />
                              : <Shield size={11} />
                            }
                            Verify DNS
                          </button>
                        )}
                        {/* Remove button */}
                        {entry.custom_domain && (
                          <button
                            onClick={() => handleRemove(entry)}
                            disabled={removing === entry.restaurant_id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Remove domain"
                          >
                            {removing === entry.restaurant_id
                              ? <RefreshCw size={14} className="animate-spin" />
                              : <Trash2 size={14} />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded DNS info row */}
                  {expanded === entry.restaurant_id && entry.custom_domain && !entry.custom_domain_verified && (
                    <tr key={`${entry.restaurant_id}-expanded`} className="bg-orange-50/50">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="text-xs font-semibold text-orange-700 mb-3 flex items-center gap-2">
                          <Clock size={13} />
                          DNS TXT Record Required — Restaurant must add this to their DNS provider
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl border border-orange-100 p-3">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">Record Name / Host</div>
                            <code className="text-xs text-gray-800 break-all">{entry.verification_txt_name}</code>
                          </div>
                          <div className="bg-white rounded-xl border border-orange-100 p-3">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">Record Value (TXT)</div>
                            <code className="text-xs text-gray-800 break-all">{entry.verification_txt_value}</code>
                          </div>
                        </div>
                        <p className="text-[11px] text-orange-600 mt-3">
                          Type: <strong>TXT</strong> · TTL: 300 · After adding, click "Verify DNS" above
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-secondary text-center">
        Click any row to see DNS TXT record details for pending domains
      </p>
    </div>
  )
}