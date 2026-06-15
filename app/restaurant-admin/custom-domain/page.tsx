'use client'

import { useState, useEffect } from 'react'
import {
  Globe, CheckCircle2, Clock, XCircle, Copy, RefreshCw,
  Trash2, ExternalLink, AlertCircle, ArrowRight, Shield
} from 'lucide-react'

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
  if (res.status === 204) return { ok: true, data: null }
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

type Step = 'idle' | 'dns' | 'done'

export default function CustomDomainPage() {
  const [domain, setDomain] = useState<DomainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState<'name' | 'value' | null>(null)
  const [step, setStep] = useState<Step>('idle')

  const showMsg = (type: 'error' | 'success', msg: string) => {
    if (type === 'error') { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 5000)
  }

  const load = async () => {
    try {
      const res = await apiFetch('/api/v1/restaurant/custom-domain/')
      if (res.ok && res.data) {
        setDomain(res.data)
        if (res.data.custom_domain) setInput(res.data.custom_domain)
        if (res.data.custom_domain_verified) setStep('done')
        else if (res.data.custom_domain) setStep('dns')
        else setStep('idle')
      } else {
        setDomain(null)
        setStep('idle')
      }
    } catch {
      setDomain(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleConnect = async () => {
    if (!input.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await apiFetch('/api/v1/restaurant/custom-domain/verify/', {
        method: 'POST',
        body: JSON.stringify({ custom_domain: input.trim() }),
      })
      if (res.ok) {
        setDomain(res.data)
        setStep('dns')
        showMsg('success', 'Domain saved! Now add the TXT record to your DNS.')
      } else {
        showMsg('error', res.data?.custom_domain?.[0] ?? res.data?.detail ?? 'Failed to save domain')
      }
    } catch {
      showMsg('error', 'Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async () => {
    if (!domain?.custom_domain) return
    setVerifying(true)
    setError('')
    try {
      const res = await apiFetch('/api/v1/restaurant/custom-domain/confirm/', {
        method: 'POST',
        body: JSON.stringify({ custom_domain: domain.custom_domain }),
      })
      if (res.ok && res.data?.custom_domain_verified) {
        setDomain(res.data)
        setStep('done')
        showMsg('success', '✅ Domain verified! Your enterprise site is now live.')
      } else {
        const err = res.data?.errors?.txt_record ?? res.data?.message ?? 'TXT record not found yet'
        showMsg('error', err)
      }
    } catch {
      showMsg('error', 'Network error')
    } finally {
      setVerifying(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Remove your custom domain? Your enterprise site will go offline.')) return
    setRemoving(true)
    try {
      const res = await apiFetch('/api/v1/restaurant/custom-domain/', { method: 'DELETE' })
      if (res.ok) {
        setDomain(null)
        setInput('')
        setStep('idle')
        showMsg('success', 'Domain removed successfully.')
      } else {
        showMsg('error', 'Failed to remove domain')
      }
    } catch {
      showMsg('error', 'Network error')
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
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <RefreshCw size={24} className="animate-spin text-orange-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe size={22} className="text-orange-500" />
          Custom Domain
        </h1>
        <p className="text-secondary text-sm mt-1">
          Connect your own domain to launch your enterprise website
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-0">
        {[
          { label: 'Connect Domain', key: 'idle' },
          { label: 'Add DNS Record', key: 'dns' },
          { label: 'Live!', key: 'done' },
        ].map((s, i) => {
          const isActive = step === s.key
          const isDone =
            (s.key === 'idle' && (step === 'dns' || step === 'done')) ||
            (s.key === 'dns' && step === 'done')

          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 flex-1 ${i > 0 ? 'pl-3' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone ? 'bg-green-500 text-white' :
                  isActive ? 'bg-orange-500 text-white' :
                  'bg-gray-100 text-secondary'
                }`}>
                  {isDone ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-orange-600' :
                  isDone ? 'text-green-600' :
                  'text-secondary'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && <ArrowRight size={14} className="text-gray-200 shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3.5 text-sm text-red-700">
          <XCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3.5 text-sm text-green-700">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {success}
        </div>
      )}

      {/* ── STEP 1: Domain Input ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Your Domain</h2>
          {domain?.custom_domain && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              domain.custom_domain_verified
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              {domain.custom_domain_verified ? '✅ Verified' : '⏳ Pending DNS'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="www.yourrestaurant.com"
            disabled={step === 'done'}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50 disabled:text-secondary"
          />
          {step !== 'done' && (
            <button
              onClick={handleConnect}
              disabled={saving || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              {saving ? 'Saving...' : step === 'dns' ? 'Update' : 'Connect'}
            </button>
          )}
          {domain?.custom_domain && (
            <button
              onClick={handleRemove}
              disabled={removing}
              className="border border-red-200 text-red-400 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-colors"
              title="Remove domain"
            >
              {removing ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
        <p className="text-xs text-secondary">
          Enter without https:// — e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">www.myrestaurant.com</code>
        </p>
      </div>

      {/* ── STEP 2: DNS TXT Record ── */}
      {step === 'dns' && domain?.verification_txt_name && (
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-500 shrink-0" />
            <h2 className="font-semibold text-gray-800">Add DNS TXT Record</h2>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Go to your domain provider (Namecheap, GoDaddy, Cloudflare, etc.) and add this TXT record.
            DNS can take <strong>5 min – 48 hours</strong> to propagate.
          </p>

          {/* DNS Table */}
          <div className="bg-white rounded-xl border border-orange-100 overflow-hidden text-sm">
            <div className="grid grid-cols-3 bg-orange-50/80 px-4 py-2.5 text-xs font-bold text-secondary uppercase tracking-wider">
              <span>Type</span><span>Name / Host</span><span>Value</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-3 border-t border-orange-50 gap-2">
              <span className="font-mono font-bold text-orange-600">TXT</span>
              <span className="font-mono text-xs text-gray-700 truncate">{domain.verification_txt_name}</span>
              <span className="font-mono text-xs text-gray-700 truncate">{domain.verification_txt_value}</span>
            </div>
          </div>

          {/* Copy fields */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1.5">
                Name / Host
              </label>
              <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5">
                <code className="text-sm text-gray-800 flex-1 break-all">{domain.verification_txt_name}</code>
                <button onClick={() => copy(domain.verification_txt_name!, 'name')} className="text-orange-400 hover:text-orange-600 shrink-0">
                  {copied === 'name' ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1.5">
                Value
              </label>
              <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5">
                <code className="text-xs text-gray-800 flex-1 break-all">{domain.verification_txt_value}</code>
                <button onClick={() => copy(domain.verification_txt_value!, 'value')} className="text-orange-400 hover:text-orange-600 shrink-0">
                  {copied === 'value' ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                </button>
              </div>
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
              : <><Shield size={14} /> I've Added the Record — Verify Now</>
            }
          </button>

          <p className="text-xs text-center text-secondary">
            DNS not propagated? Wait a few minutes and try again.
          </p>
        </div>
      )}

      {/* ── STEP 3: Verified ── */}
      {step === 'done' && domain?.custom_domain && (
        <div className="bg-green-50 rounded-2xl border border-green-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-green-800">Your Enterprise Site is Live!</h2>
              <p className="text-sm text-green-600">Domain verified and connected successfully</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-100 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-secondary mb-0.5">Live URL</p>
              <p className="font-semibold text-gray-800">{domain.custom_domain}</p>
            </div>
            <a
              href={`https://${domain.custom_domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Visit Site <ExternalLink size={13} />
            </a>
          </div>

          {domain.custom_domain_verified_at && (
            <p className="text-xs text-green-600">
              Verified on {new Date(domain.custom_domain_verified_at).toLocaleDateString('en-NP', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}

          <button
            onClick={() => setStep('idle')}
            className="text-sm text-green-600 underline"
          >
            Change domain
          </button>
        </div>
      )}

      {/* How it works — only on idle */}
      {step === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">How it works</h3>
          <ol className="space-y-3">
            {[
              { step: '1', text: 'Enter your domain and click Connect', icon: Globe },
              { step: '2', text: 'Add the TXT record to your DNS provider', icon: AlertCircle },
              { step: '3', text: 'Click Verify — we check your DNS', icon: Shield },
              { step: '4', text: 'Your enterprise site goes live!', icon: CheckCircle2 },
            ].map((item) => (
              <li key={item.step} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {item.step}
                </span>
                {item.text}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}