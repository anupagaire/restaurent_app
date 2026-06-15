'use client'

import { useState, useEffect } from 'react'
import { Globe, CheckCircle2, Clock, XCircle, Copy, RefreshCw, Trash2, ExternalLink, AlertCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : ''
}

interface DomainData {
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
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.detail ?? data?.custom_domain?.[0] ?? 'Request failed')
  return data
}

export default function CustomDomainSettings() {
  const [data, setData] = useState<DomainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [domainInput, setDomainInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState<'name' | 'value' | null>(null)

  const load = async () => {
    try {
      const res = await apiFetch('/api/v1/restaurant/custom-domain/')
      setData(res)
      if (res?.custom_domain) setDomainInput(res.custom_domain)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!domainInput.trim()) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      // POST /api/v1/restaurant/custom-domain/verify/
      const res = await apiFetch('/api/v1/restaurant/custom-domain/verify/', {
        method: 'POST',
        body: JSON.stringify({ custom_domain: domainInput.trim() }),
      })
      setData(res)
      setSuccess('Domain saved! Now add the TXT record below to your DNS.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async () => {
    if (!data?.custom_domain) return
    setVerifying(true)
    setError('')
    setSuccess('')
    try {
      // POST /api/v1/restaurant/custom-domain/confirm/
      const res = await apiFetch('/api/v1/restaurant/custom-domain/confirm/', {
        method: 'POST',
        body: JSON.stringify({ custom_domain: data.custom_domain }),
      })
      setData(res)
      if (res?.custom_domain_verified) {
        setSuccess('✅ Domain verified successfully! Your enterprise site is now live.')
      } else {
        setError('DNS record not found yet. It can take up to 24-48 hours to propagate.')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setVerifying(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Remove custom domain? Your enterprise site will go offline.')) return
    setRemoving(true)
    setError('')
    try {
      // DELETE /api/v1/restaurant/custom-domain/
      await apiFetch('/api/v1/restaurant/custom-domain/', { method: 'DELETE' })
      setData(null)
      setDomainInput('')
      setSuccess('Domain removed.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setRemoving(false)
    }
  }

  const copy = async (text: string, type: 'name' | 'value') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-10 bg-gray-200 rounded mb-3" />
        <div className="h-10 bg-gray-200 rounded w-1/2" />
      </div>
    )
  }

  const isVerified = data?.custom_domain_verified
  const hasDomain = !!data?.custom_domain
  const hasTxtRecord = !!data?.verification_txt_name

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Globe size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Custom Domain</h3>
          <p className="text-sm text-secondary">Connect your own domain to your enterprise site</p>
        </div>
        {/* Status badge */}
        {hasDomain && (
          <div className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isVerified
              ? 'bg-green-50 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {isVerified
              ? <><CheckCircle2 size={13} /> Verified</>
              : <><Clock size={13} /> Pending</>
            }
          </div>
        )}
      </div>

      {/* Error / Success */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
          <XCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {success}
        </div>
      )}

      {/* Domain Input */}
      <div className="rounded-2xl border border-gray-100 p-5 space-y-3">
        <label className="text-sm font-semibold text-gray-700">Your Domain</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="www.yourrestaurant.com"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            disabled={isVerified}
          />
          {!isVerified && (
            <button
              onClick={handleSave}
              disabled={saving || !domainInput.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : hasDomain ? 'Update' : 'Connect'}
            </button>
          )}
          {hasDomain && (
            <button
              onClick={handleRemove}
              disabled={removing}
              className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-2.5 rounded-xl text-sm transition-colors"
              title="Remove domain"
            >
              {removing ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          )}
        </div>
        <p className="text-xs text-secondary">
          Enter your domain without https:// — e.g. <code className="bg-gray-100 px-1 rounded">www.myrestaurant.com</code>
        </p>
      </div>

      {/* DNS TXT Record — show after domain saved */}
      {hasDomain && !isVerified && hasTxtRecord && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-500" />
            <h4 className="font-semibold text-gray-800 text-sm">Add this DNS TXT Record</h4>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Go to your domain provider (Namecheap, GoDaddy, Cloudflare, etc.) and add this TXT record.
            DNS changes can take <strong>up to 48 hours</strong> to propagate.
          </p>

          {/* TXT Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Record Name / Host</label>
            <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5">
              <code className="text-sm text-gray-800 flex-1 break-all">{data.verification_txt_name}</code>
              <button
                onClick={() => copy(data.verification_txt_name!, 'name')}
                className="shrink-0 text-orange-400 hover:text-orange-600 transition-colors"
              >
                {copied === 'name' ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>

          {/* TXT Value */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Record Value</label>
            <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5">
              <code className="text-xs text-gray-800 flex-1 break-all">{data.verification_txt_value}</code>
              <button
                onClick={() => copy(data.verification_txt_value!, 'value')}
                className="shrink-0 text-orange-400 hover:text-orange-600 transition-colors"
              >
                {copied === 'value' ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>

          {/* DNS help table */}
          <div className="bg-white rounded-xl border border-orange-100 overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-orange-50 px-4 py-2 font-semibold text-gray-600">
              <span>Type</span><span>Name</span><span>Value</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2.5 text-gray-700 border-t border-orange-50">
              <span className="font-mono font-bold">TXT</span>
              <span className="truncate font-mono">{data.verification_txt_name}</span>
              <span className="truncate font-mono">{data.verification_txt_value?.slice(0, 20)}...</span>
            </div>
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-40 transition-colors"
          >
            {verifying
              ? <><RefreshCw size={14} className="animate-spin" /> Checking DNS...</>
              : <><CheckCircle2 size={14} /> I've Added the TXT Record — Verify Now</>
            }
          </button>
        </div>
      )}

      {/* Verified state */}
      {isVerified && data?.custom_domain && (
        <div className="rounded-2xl bg-green-50 border border-green-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <h4 className="font-semibold text-green-800">Domain Verified!</h4>
          </div>
          <p className="text-sm text-green-700">
            Your enterprise site is live at{' '}
            <a
              href={`https://${data.custom_domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline inline-flex items-center gap-1"
            >
              {data.custom_domain} <ExternalLink size={12} />
            </a>
          </p>
          {data.custom_domain_verified_at && (
            <p className="text-xs text-green-600">
              Verified on {new Date(data.custom_domain_verified_at).toLocaleDateString('en-NP', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}
          <button
            onClick={() => { setData(prev => prev ? { ...prev, custom_domain_verified: false } : prev) }}
            className="text-xs text-green-600 underline"
          >
            Change domain
          </button>
        </div>
      )}

      {/* How it works */}
      {!hasDomain && (
        <div className="rounded-2xl border border-gray-100 p-5">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">How it works</h4>
          <ol className="space-y-2.5">
            {[
              'Enter your domain name above and click Connect',
              'Add the TXT record to your DNS provider',
              'Click "Verify" — we\'ll check the record',
              'Your enterprise site goes live on your domain!',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}