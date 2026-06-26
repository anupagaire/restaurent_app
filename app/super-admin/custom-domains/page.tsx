'use client'

import { useState, useEffect } from 'react'
import {
  Globe, CheckCircle2, Clock, XCircle, RefreshCw,
  Search, ExternalLink, Trash2, Shield, Plus, AlertCircle
} from 'lucide-react'
import React from 'react' 
const API = process.env.NEXT_PUBLIC_API_URL ?? ''

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : ''
}

interface RestaurantDomain {
  id: number
  name: string
  city: string
  status: boolean
  custom_domain: string | null
  custom_domain_verified: boolean
  custom_domain_verified_at: string | null
  domain_verification_token: string | null
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
  if (res.status === 204) return { ok: true, data: null }
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

function StatusBadge({ verified, hasDomain }: { verified: boolean; hasDomain: boolean }) {
  if (!hasDomain) return <span className="text-gray-300 text-xs">—</span>
  return verified ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      <CheckCircle2 size={11} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
      <Clock size={11} /> Pending DNS
    </span>
  )
}

export default function CustomDomainsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'none'>('all')
  const [verifying, setVerifying] = useState<number | null>(null)
  const [clearing, setClearing] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Set domain modal
  const [setDomainModal, setSetDomainModal] = useState<RestaurantDomain | null>(null)
  const [domainInput, setDomainInput] = useState('')
  const [settingDomain, setSettingDomain] = useState(false)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 5000)
  }

  // ── GET /api/v1/admin/restaurant-domain/ ──────────────────────────
  const load = async (searchTerm = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page_size: '1000' })
      if (searchTerm) params.set('search', searchTerm)
      const res = await apiFetch(`/api/v1/admin/restaurant-domain/?${params}`)
      if (res.ok) {
        setRestaurants(res.data?.results ?? [])
      } else {
        showMsg('error', 'Failed to load domain list')
      }
    } catch {
      showMsg('error', 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── POST /api/v1/admin/restaurant-domain/{id}/verify-domain/ ──────
  const handleVerify = async (r: RestaurantDomain) => {
    setVerifying(r.id)
    try {
      const res = await apiFetch(`/api/v1/admin/restaurant-domain/${r.id}/verify-domain/`, {
        method: 'POST',
        body: JSON.stringify({ custom_domain: r.custom_domain }),
      })
      if (res.ok && res.data?.custom_domain_verified) {
        showMsg('success', `✅ ${r.name}'s domain verified!`)
        setRestaurants(prev => prev.map(x =>
          x.id === r.id ? { ...x, ...res.data } : x
        ))
        setExpanded(null)
      } else {
        showMsg('error', `❌ DNS verification failed for ${r.name}. Make sure TXT record is added.`)
      }
    } catch {
      showMsg('error', 'Verification request failed')
    } finally {
      setVerifying(null)
    }
  }

  // ── POST /api/v1/admin/restaurant-domain/{id}/set-domain/ ─────────
  const handleSetDomain = async () => {
    if (!setDomainModal || !domainInput.trim()) return
    setSettingDomain(true)
    try {
      const res = await apiFetch(`/api/v1/admin/restaurant-domain/${setDomainModal.id}/set-domain/`, {
        method: 'POST',
        body: JSON.stringify({ custom_domain: domainInput.trim() }),
      })
      if (res.ok) {
        showMsg('success', `Domain set for ${setDomainModal.name}!`)
        setRestaurants(prev => prev.map(x =>
          x.id === setDomainModal.id ? { ...x, ...res.data } : x
        ))
        setSetDomainModal(null)
        setDomainInput('')
      } else {
        showMsg('error', res.data?.custom_domain?.[0] ?? res.data?.detail ?? 'Failed to set domain')
      }
    } catch {
      showMsg('error', 'Network error')
    } finally {
      setSettingDomain(false)
    }
  }

  // ── POST /api/v1/admin/restaurant-domain/{id}/clear-domain/ ───────
  const handleClear = async (r: RestaurantDomain) => {
    if (!confirm(`Remove domain "${r.custom_domain}" from ${r.name}?`)) return
    setClearing(r.id)
    try {
      const res = await apiFetch(`/api/v1/admin/restaurant-domain/${r.id}/clear-domain/`, {
        method: 'POST',
        body: JSON.stringify({ custom_domain: r.custom_domain }),
      })
      if (res.ok) {
        showMsg('success', `Domain removed from ${r.name}`)
        setRestaurants(prev => prev.map(x =>
          x.id === r.id ? { ...x, custom_domain: null, custom_domain_verified: false, custom_domain_verified_at: null } : x
        ))
      } else {
        showMsg('error', 'Failed to remove domain')
      }
    } catch {
      showMsg('error', 'Network error')
    } finally {
      setClearing(null)
    }
  }

  // ── Filter + Search ────────────────────────────────────────────────
  const filtered = restaurants.filter(r => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase()) ||
      (r.custom_domain ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'verified' ? r.custom_domain_verified :
      filter === 'pending' ? (!!r.custom_domain && !r.custom_domain_verified) :
      !r.custom_domain
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
            <Globe size={22} className="text-accent-500" /> Custom Domains
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage enterprise custom domains for all restaurants
          </p>
        </div>
        <button
          onClick={() => load(search)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
          msg.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Domains', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-100' },
          { label: 'Verified', value: stats.verified, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Pending DNS', value: stats.pending, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border ${stat.border}`}>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurant, city or domain..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(search)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'verified', 'pending', 'none'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-accent-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
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
            <RefreshCw size={24} className="animate-spin text-accent-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Globe size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No results found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Restaurant</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Domain</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified At</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(entry => (
                // <>
                <React.Fragment key={entry.id}>
                  <tr
                    key={entry.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      entry.custom_domain && !entry.custom_domain_verified ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => {
                      if (entry.custom_domain && !entry.custom_domain_verified) {
                        setExpanded(expanded === entry.id ? null : entry.id)
                      }
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 text-sm">{entry.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{entry.city} · ID: {entry.id}</div>
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
                              className="text-accent-400 hover:text-accent-600 transition-colors"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">No domain set</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge verified={entry.custom_domain_verified} hasDomain={!!entry.custom_domain} />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {entry.custom_domain_verified_at
                        ? new Date(entry.custom_domain_verified_at).toLocaleDateString('en-NP', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })
                        : <span className="text-gray-200">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>

                        {/* Set Domain button — no domain yet */}
                        {!entry.custom_domain && (
                          <button
                            onClick={() => { setSetDomainModal(entry); setDomainInput('') }}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Plus size={11} /> Set Domain
                          </button>
                        )}

                        {/* Verify button — pending only */}
                        {entry.custom_domain && !entry.custom_domain_verified && (
                          <button
                            onClick={() => handleVerify(entry)}
                            disabled={verifying === entry.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                          >
                            {verifying === entry.id
                              ? <RefreshCw size={11} className="animate-spin" />
                              : <Shield size={11} />
                            }
                            Verify DNS
                          </button>
                        )}

                        {/* Verified badge */}
                        {entry.custom_domain_verified && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={13} /> Live
                          </span>
                        )}

                        {/* Clear domain button */}
                        {entry.custom_domain && (
                          <button
                            onClick={() => handleClear(entry)}
                            disabled={clearing === entry.id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Remove domain"
                          >
                            {clearing === entry.id
                              ? <RefreshCw size={14} className="animate-spin" />
                              : <Trash2 size={14} />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded DNS record row */}
                  {expanded === entry.id && entry.custom_domain && !entry.custom_domain_verified && (
                    <tr key={`${entry.id}-dns`} className="bg-accent-50/40">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-accent-700 mb-3">
                          <AlertCircle size={13} />
                          DNS TXT Record — Restaurant must add this to their DNS provider
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white rounded-xl border border-accent-100 p-3">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</div>
                            <code className="text-sm font-bold text-accent-600">TXT</code>
                          </div>
                          <div className="bg-white rounded-xl border border-accent-100 p-3">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Name / Host</div>
                            <code className="text-xs text-gray-800 break-all">{entry.custom_domain}</code>
                          </div>
                          <div className="bg-white rounded-xl border border-accent-100 p-3">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Value (Token)</div>
                            <code className="text-xs text-gray-800 break-all">{entry.domain_verification_token}</code>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <p className="text-[11px] text-accent-600">
                            TTL: 300 · After DNS propagates (5min–48hrs), click "Verify DNS" above
                          </p>
                          <button
                            onClick={() => handleVerify(entry)}
                            disabled={verifying === entry.id}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                          >
                            {verifying === entry.id
                              ? <RefreshCw size={11} className="animate-spin" />
                              : <Shield size={11} />
                            }
                            Verify Now
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
              
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Click a pending domain row to see DNS TXT record details · Use "Set Domain" to assign domain on behalf of restaurant
      </p>

      {/* Set Domain Modal */}
      {setDomainModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSetDomainModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Set Custom Domain</h3>
              <p className="text-sm text-gray-500 mt-1">
                Assign a domain to <strong>{setDomainModal.name}</strong>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Domain</label>
              <input
                type="text"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                placeholder="www.restaurantname.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">Without https:// — e.g. www.pizza-palace.com</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSetDomainModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetDomain}
                disabled={settingDomain || !domainInput.trim()}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors"
              >
                {settingDomain ? 'Setting...' : 'Set Domain'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}