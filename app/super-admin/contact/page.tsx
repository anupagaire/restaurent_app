"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

type Status = "pending" | "resolved" | "rejected";

interface ContactMessage {
  id: number;
  created_on: string;
  updated_on: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: Status;
  is_checked: boolean;
  admin_note: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContactMessage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS: Status[] = ["pending", "resolved", "rejected"];

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-accent text-accent border border-accent",
  resolved: "bg-green-50 text-green-800 border border-green-200",
  rejected: "bg-red-50 text-red-800 border border-red-200",
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({
  msg,
  onClose,
  onUpdate,
}: {
  msg: ContactMessage;
  onClose: () => void;
  onUpdate: (updated: ContactMessage) => void;
}) => {
  const [status, setStatus] = useState<Status>(msg.status);
  const [adminNote, setAdminNote] = useState(msg.admin_note || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full px-3 py-2 text-sm border border-accent rounded-lg bg-white text-[#3a2a1a] placeholder:text-[#b8a898] focus:outline-none focus:border-secondary transition";

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/v1/admin/contact/${msg.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_note: adminNote, is_checked: true }),
      });
      if (!res.ok) throw new Error("Failed to update.");
      const updated: ContactMessage = await res.json();
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#faf8f5] rounded-2xl border border-accent w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-accent sticky top-0 bg-[#faf8f5] z-10">
          <div className="flex-1 pr-4">
            <h2 className="text-base font-semibold text-secondary leading-snug">{msg.subject}</h2>
            <p className="text-xs text-secondary mt-0.5">Message #{msg.id}</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-secondary transition text-xl leading-none mt-0.5">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sender Info */}
          <div className="bg-white border border-accent rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-3 pb-3 border-b border-[#ead9c5]">
              Sender details
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs text-secondary">Name</p>
                <p className="text-sm font-medium text-[#3a2a1a]">{msg.name}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Email</p>
                <a href={`mailto:${msg.email}`} className="text-sm font-medium text-secondary hover:underline">
                  {msg.email}
                </a>
              </div>
              <div>
                <p className="text-xs text-secondary">Phone</p>
                <a href={`tel:${msg.phone}`} className="text-sm font-medium text-[#3a2a1a] hover:underline">
                  {msg.phone || "—"}
                </a>
              </div>
              <div>
                <p className="text-xs text-secondary">Received</p>
                <p className="text-sm font-medium text-[#3a2a1a]">
                  {new Date(msg.created_on).toLocaleDateString("en-US", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white border border-accent rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-3 pb-3 border-b border-[#ead9c5]">
              Message
            </h3>
            <p className="text-sm text-[#3a2a1a] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          {/* Admin Controls */}
          <div className="bg-white border border-accent rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-3 pb-3 border-b border-[#ead9c5]">
              Admin action
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-secondary">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={inputClass}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-secondary">Admin note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal note…"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-[#7a4b2a] disabled:opacity-60 transition"
                >
                  {saved ? "Saved ✓" : saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#b8a898]">
            Submitted {new Date(msg.created_on).toLocaleString()} · Updated {new Date(msg.updated_on).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [ordering, setOrdering] = useState("-created_on");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const totalPages = Math.ceil(count / pageSize);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", String(pageSize));
      if (search) params.set("search", search);
      if (ordering) params.set("ordering", ordering);
      if (statusFilter) params.set("status", statusFilter);

      const res = await apiFetch(`/api/v1/admin/contact/?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch messages.");
      const data: PaginatedResponse = await res.json();
      setMessages(data.results);
      setCount(data.count);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, ordering, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleUpdate = (updated: ContactMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelected(updated);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    await apiFetch(`/api/v1/admin/contact/${id}/`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setCount((c) => c - 1);
    if (selected?.id === id) setSelected(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Stats
  const pendingCount = messages.filter((m) => m.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-screen-xl mx-auto px-4 py-10">

        {/* Heading */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Contact Messages</h1>
            <p className="text-secondary mt-1">
              {count} total · {pendingCount} pending
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-accent rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, subject…"
                className="flex-1 px-3 py-2 text-sm border border-accent rounded-lg bg-white text-[#3a2a1a] placeholder:text-[#b8a898] focus:outline-none focus:border-secondary transition"
              />
              <button type="submit" className="px-4 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-[#7a4b2a] transition">
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                  className="px-3 py-2 text-sm text-secondary border border-accent rounded-lg hover:bg-[#fdf5ec] transition"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-secondary">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as Status | ""); setPage(1); }}
                className="px-3 py-2 text-sm border border-accent rounded-lg bg-white text-[#3a2a1a] focus:outline-none focus:border-secondary transition"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-secondary">Sort by</label>
              <select
                value={ordering}
                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-accent rounded-lg bg-white text-[#3a2a1a] focus:outline-none focus:border-secondary transition"
              >
                <option value="-created_on">Newest first</option>
                <option value="created_on">Oldest first</option>
                <option value="status">Status</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-accent rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-secondary text-sm">
              Loading messages…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-600 text-sm">{error}</div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-secondary text-sm">
              No messages found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ead9c5] bg-[#fdf5ec]">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary">From</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary hidden md:table-cell">Subject</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary hidden lg:table-cell">Received</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ead9c5]">
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className={`hover:bg-[#fdf5ec] transition cursor-pointer ${!msg.is_checked ? "bg-[#fffbf5]" : ""}`}
                      onClick={() => setSelected(msg)}
                    >
                      <td className="px-4 py-3 text-secondary font-mono text-xs">{msg.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!msg.is_checked && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent0 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-[#3a2a1a]">{msg.name}</p>
                            <p className="text-xs text-secondary">{msg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#3a2a1a] hidden md:table-cell max-w-[200px]">
                        <p className="truncate">{msg.subject}</p>
                        <p className="text-xs text-secondary truncate">{msg.message}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[msg.status] ?? ""}`}>
                          {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-secondary hidden lg:table-cell">
                        {new Date(msg.created_on).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelected(msg)}
                            className="px-3 py-1.5 text-xs text-secondary border border-accent rounded-lg hover:bg-[#fdf5ec] transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <p className="text-secondary text-xs">
              Page {page} of {totalPages} · {count} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs text-secondary border border-accent rounded-lg hover:bg-[#fdf5ec] disabled:opacity-40 transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs text-secondary border border-accent rounded-lg hover:bg-[#fdf5ec] disabled:opacity-40 transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          msg={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}