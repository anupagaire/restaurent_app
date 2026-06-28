
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
  const [changingDomain, setChangingDomain] = useState(false)

  // Modals
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false)
  const [showChangeWarning, setShowChangeWarning] = useState(false)

  const showMsg = (type: 'error' | 'success', msg: string) => {
    if (type === 'error') { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 6000)
  }

  const load = async () => {
    try {
      const res = await apiFetch('/api/v1/restaurant/custom-domain/')
      if (res.ok && res.data?.custom_domain) {
        setDomain(res.data)
        setInput(res.data.custom_domain)
        if (res.data.custom_domain_verified) setStep('done')
        else setStep('dns')
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

  // ── Connect new domain (generates NEW token — warn if already has domain)
  const handleConnect = async () => {
    if (!input.trim()) return
    setSaving(true)
    setError('')
    setShowChangeWarning(false)
    try {
      const res = await apiFetch('/api/v1/restaurant/custom-domain/verify/', {
        method: 'POST',
        body: JSON.stringify({ custom_domain: input.trim() }),
      })
      if (res.ok) {
        setDomain(res.data)
        setInput(res.data.custom_domain)
        setStep('dns')
        setChangingDomain(false)
        showMsg('success', 'Domain connected! Add the TXT record below to your DNS.')
      } else {
        const domainError = res.data?.errors?.custom_domain
         if (typeof domainError === 'string' && domainError.toLowerCase().includes('subscription')) {
    setError('__upgrade__') // special flag
  } else {
    showMsg('error', domainError ?? res.data?.detail ?? 'Failed to connect domain')
  }
}}
    //     showMsg('error', res.data?.custom_domain?.[0] ?? res.data?.detail ?? 'Failed to connect domain')
    //   }
    // }
     catch {
      showMsg('error', 'Network error')
    } finally {
      setSaving(false)
    }
  }

  // ── Verify DNS (does NOT change token — safe to call multiple times)
  const handleVerify = async () => {
    if (!domain?.custom_domain) return
    setShowVerifyConfirm(false)
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
        const err = res.data?.errors?.txt_record ?? res.data?.message ?? 'TXT record not found yet.'
        showMsg('error', `${err} — Wait a few minutes and try again.`)
      }
    } catch {
      showMsg('error', 'Network error')
    } finally {
      setVerifying(false)
    }
  }

  // ── Remove domain
  

  const copy = async (text: string, type: 'name' | 'value') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <RefreshCw size={24} className="animate-spin text-accent-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe size={22} className="text-accent-500" />
            Custom Domain
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Connect your own domain to launch your enterprise website
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors" title="Refresh">
          <RefreshCw size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center">
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
                  isActive ? 'bg-accent-500 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-accent-600' : isDone ? 'text-green-600' : 'text-gray-400'
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
     {/* Messages */}
{error === '__upgrade__' ? (
  <div className="bg-gradient-to-br from-accent-50 to-yellow-50 border border-accent-200 rounded-2xl p-5 space-y-3">
    <div className="flex items-center gap-2">
      <span className="text-xl">🔒</span>
      <h3 className="font-bold text-gray-800">Custom Domain is a Premium Feature</h3>
    </div>
    <p className="text-sm text-gray-600">
      Your current plan doesn't include custom domain support. Upgrade to connect your own domain and launch your enterprise site.
    </p>
    <div className="flex items-center gap-3 pt-1">
      <a
        href="/restaurant-admin/subscription"
        className="bg-accent hover:bg-accent-600 text-sm text-white font-semibold px-4 py-2 rounded-xl transition-colors"
      >
        View Plans & Upgrade →
      </a>
      <button
        onClick={() => setError('')}
        className="text-sm text-gray-400 hover:text-gray-600"
      >
        Dismiss
      </button>
    </div>
  </div>
) : error ? (
  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3.5 text-sm text-red-700">
    <XCircle size={16} className="shrink-0 mt-0.5" /> {error}
  </div>
) : null}
{success && (
  <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3.5 text-sm text-green-700">
    <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {success}
  </div>
)}

      {/* ── STEP 1 — idle or changing ── */}
      {(step === 'idle' || changingDomain) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">
            {changingDomain ? 'Change Domain' : 'Connect Your Domain'}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !saving && input.trim() && handleConnect()}
              placeholder="www.yourrestaurant.com"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
              autoFocus={changingDomain}
            />
            <button
              onClick={handleConnect}
              disabled={saving || !input.trim()}
              className="bg-accent-900 hover:bg-accent-600 text-black font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              {saving ? 'Connecting...' : 'Connect'}
            </button>
            {changingDomain && (
              <button
                onClick={() => { setChangingDomain(false); setInput(domain?.custom_domain ?? '') }}
                className="border border-gray-200 text-gray-500 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Without https:// · e.g. <code className="bg-gray-100 px-1 rounded">www.myrestaurant.com</code>
          </p>
        </div>
      )}

      {/* ── STEP 2 — dns ── */}
      {step === 'dns' && !changingDomain && domain && (
        <div className="space-y-4">

          {/* Current domain */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Connected Domain</p>
              <p className="font-mono font-semibold text-gray-800">{domain.custom_domain}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 flex items-center gap-1">
                <Clock size={11} /> Pending DNS
              </span>
              {/* Change → warn user token will change */}
              <button
                onClick={() => setShowChangeWarning(true)}
                className="text-xs text-gray-400 hover:text-accent-500 underline transition-colors"
              >
                Change
              </button>
             
            </div>
          </div>

          {/* TXT record */}
          <div className="bg-accent-50 rounded-2xl border border-accent-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-accent-500 shrink-0" />
              <h2 className="font-semibold text-gray-800">Add This TXT Record to Your DNS</h2>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Go to your DNS provider and add this record. DNS can take <strong>5 min – 48 hours</strong> to propagate.
            </p>

            {/* Table */}
            <div className="bg-white rounded-xl border border-accent-100 overflow-hidden">
              <div className="grid grid-cols-3 bg-accent-50/80 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Type</span><span>Name / Host</span><span>Value</span>
              </div>
              <div className="grid grid-cols-3 px-4 py-3 border-t border-accent-50 gap-2 items-center">
                <span className="font-mono font-bold text-accent-600 text-sm">TXT</span>
                <span className="font-mono text-xs text-gray-700 truncate">{domain.verification_txt_name}</span>
                <span className="font-mono text-xs text-gray-700 truncate">{domain.verification_txt_value}</span>
              </div>
            </div>

            {/* Vercel hint */}
            <div className="bg-white rounded-xl border border-accent-100 p-3 text-xs text-gray-600 space-y-1.5">
              <p className="font-semibold text-gray-700">🔷 If using Vercel DNS:</p>
              <div className="font-mono bg-gray-50 rounded p-2 text-[11px] space-y-0.5">
                <p>Name: <strong>{domain.verification_txt_name?.split('.')[0] ?? '@'}</strong></p>
                <p>Type: <strong>TXT</strong></p>
                <p>Value: <strong>{domain.verification_txt_value}</strong></p>
                <p>TTL: <strong>60</strong></p>
              </div>
            </div>

            {/* Copy fields */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Name / Host</label>
                <div className="flex items-center gap-2 bg-white border border-accent-100 rounded-xl px-3 py-2.5">
                  <code className="text-sm text-gray-800 flex-1 break-all">{domain.verification_txt_name}</code>
                  <button onClick={() => copy(domain.verification_txt_name!, 'name')} className="text-accent-400 hover:text-accent-600 shrink-0 p-1">
                    {copied === 'name' ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Value</label>
                <div className="flex items-center gap-2 bg-white border border-accent-100 rounded-xl px-3 py-2.5">
                  <code className="text-xs text-gray-800 flex-1 break-all">{domain.verification_txt_value}</code>
                  <button onClick={() => copy(domain.verification_txt_value!, 'value')} className="text-accent-400 hover:text-accent-600 shrink-0 p-1">
                    {copied === 'value' ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Verify button — opens confirm popup */}
            <button
              onClick={() => setShowVerifyConfirm(true)}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-40 transition-colors"
            >
              {verifying
                ? <><RefreshCw size={14} className="animate-spin" /> Checking DNS...</>
                : <><Shield size={14} /> I&apos;ve Added the Record — Verify Now</>
              }
            </button>

            <p className="text-xs text-center text-gray-400">
              Verification does NOT change your token. Safe to retry anytime.
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 3 — done ── */}
      {step === 'done' && domain?.custom_domain && !changingDomain && (
        <div className="bg-green-50 rounded-2xl border border-green-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-green-800">Enterprise Site is Live! 🎉</h2>
              <p className="text-sm text-green-600">Domain verified and connected</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-100 p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Live URL</p>
              <p className="font-semibold text-gray-800 font-mono truncate">{domain.custom_domain}</p>
            </div>
            <a
              href={`https://${domain.custom_domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shrink-0"
            >
              Visit <ExternalLink size={13} />
            </a>
          </div>

          {domain.custom_domain_verified_at && (
            <p className="text-xs text-green-600">
              ✅ Verified on {new Date(domain.custom_domain_verified_at).toLocaleDateString('en-NP', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setShowChangeWarning(true)}
              className="text-sm text-gray-500 hover:text-accent-500 underline transition-colors"
            >
              Change domain
            </button>
            <span className="text-gray-200">·</span>
           
          </div>
        </div>
      )}

      {/* How it works */}
      {step === 'idle' && !changingDomain && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">How it works</h3>
          <ol className="space-y-3">
            {[
              'Enter your domain and click Connect',
              'Add the TXT record shown to your DNS provider',
              'Click "Verify" — we check your DNS automatically',
              'Your enterprise website goes live on your domain!',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </div>
      )}

      {showVerifyConfirm && domain && (
        <div
          className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowVerifyConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto">
              <Shield size={22} className="text-accent-500" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-lg">Confirm DNS Verification</h3>
              <p className="text-gray-500 text-sm mt-1">
                Make sure you&apos;ve added this TXT record to your DNS provider:
              </p>
            </div>

            <div className="bg-accent-50 rounded-xl border border-accent-100 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Type</span>
                <span className="font-mono font-bold text-accent-600">TXT</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400 font-medium shrink-0">Name</span>
                <span className="font-mono text-gray-700 text-right break-all">{domain.verification_txt_name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400 font-medium shrink-0">Value</span>
                <span className="font-mono text-gray-700 text-right break-all">{domain.verification_txt_value}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700">
              ✅ Verifying is <strong>safe to retry</strong> — it does NOT change your TXT token.
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              ⚡ DNS changes can take <strong>5 min – 48 hours</strong> to propagate. If it fails, wait and try again.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVerifyConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Not yet
              </button>
              <button
                onClick={handleVerify}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Yes, Verify!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL 2 — Change Domain Warning
          (verify/ endpoint — NEW token generate हुन्छ ⚠️)
      ══════════════════════════════════════════ */}
      {showChangeWarning && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowChangeWarning(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto">
              <AlertCircle size={22} className="text-yellow-500" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-lg">⚠️ Warning</h3>
              <p className="text-gray-500 text-sm mt-1">
                Changing your domain will generate a <strong>NEW verification token</strong>.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-800 space-y-2">
              <p className="font-semibold">What will happen:</p>
              <ul className="space-y-1.5 text-xs">
                <li>• Your current TXT record value will become <strong>invalid</strong></li>
                <li>• You must <strong>update your DNS</strong> with the new token</li>
                <li>• Your enterprise site will go <strong>offline</strong> until re-verified</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowChangeWarning(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowChangeWarning(false)
                  setChangingDomain(true)
                  setInput(domain?.custom_domain ?? '')
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                I Understand, Change
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
