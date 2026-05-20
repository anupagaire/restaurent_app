"use client";


import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Status = "pending" | "approved" | "rejected";

interface Application {
  id: number;
  created_on: string;
  updated_on: string;
  status: Status;
  is_checked: boolean;
  admin_note: string;
  restaurant_name: string;
  cuisine_type: string;
  city: string;
  area: string;
  full_address: string;
  description: string;
  owner_name: string;
  phone: string;
  email: string;
  whatsapp: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Application[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS: Status[] = ["pending", "approved", "rejected"];

const STATUS_STYLES: Record<Status, { badge: string; label: string }> = {
  pending: {
    badge: "bg-amber-50 text-amber-800 border border-amber-200",
    label: "Pending",
  },
  approved: {
    badge: "bg-green-50 text-green-800 border border-green-200",
    label: "Approved",
  },
  rejected: {
    badge: "bg-red-50 text-red-800 border border-red-200",
    label: "Rejected",
  },
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({
  app,
  onClose,
  onStatusChange,
}: {
  app: Application;
  onClose: () => void;
  onStatusChange: (id: number, status: Status, note: string) => Promise<void>;
}) => {
  const [status, setStatus] = useState<Status>(app.status);
  const [adminNote, setAdminNote] = useState(app.admin_note || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onStatusChange(app.id, status, adminNote);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-[#d4b78f] rounded-lg bg-white text-[#3a2a1a] placeholder:text-[#b8a898] focus:outline-none focus:border-[#8c6d46] transition";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#faf8f5] rounded-2xl border border-[#d4b78f] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4b78f] sticky top-0 bg-[#faf8f5] z-10">
          <div>
            <h2 className="text-lg font-semibold text-[#513012]">{app.restaurant_name}</h2>
            <p className="text-xs text-[#8c6d46]">Application #{app.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#776552] hover:text-[#513012] transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Restaurant Info */}
          <Section title="Restaurant details">
            <InfoGrid>
              <InfoItem label="Cuisine" value={app.cuisine_type} />
              <InfoItem label="City" value={app.city} />
              <InfoItem label="Area" value={app.area} />
              <InfoItem label="Full address" value={app.full_address || "—"} />
            </InfoGrid>
            {app.description && (
              <p className="text-sm text-[#3a2a1a] mt-2 pt-2 border-t border-[#ead9c5]">
                {app.description}
              </p>
            )}
          </Section>

          {/* Owner Info */}
          <Section title="Owner / contact">
            <InfoGrid>
              <InfoItem label="Owner" value={app.owner_name} />
              <InfoItem label="Phone" value={app.phone} />
              <InfoItem label="Email" value={app.email} />
              <InfoItem label="WhatsApp" value={app.whatsapp || "—"} />
            </InfoGrid>
          </Section>

          {/* Admin Controls */}
          <Section title="Admin action">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#776552]">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_STYLES[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-[#776552]">Admin note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional note for internal reference…"
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm bg-[#513012] text-white rounded-lg hover:bg-[#7a4b2a] disabled:opacity-60 transition"
              >
                {saved ? "Saved ✓" : saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </Section>

          {/* Meta */}
          <div className="text-xs text-[#b8a898] pt-1 border-t border-[#ead9c5]">
            Submitted {new Date(app.created_on).toLocaleString()} · Last updated{" "}
            {new Date(app.updated_on).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const RestaurantApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [ordering, setOrdering] = useState<string>("-created_on");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const totalPages = Math.ceil(count / pageSize);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", String(pageSize));
      if (search) params.set("search", search);
      if (ordering) params.set("ordering", ordering);
      if (statusFilter) params.set("status", statusFilter);

      const res = await apiFetch(`/api/v1/admin/register-restaurant/?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch applications.");
      const data: PaginatedResponse = await res.json();
      setApplications(data.results);
      setCount(data.count);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, ordering, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (id: number, status: Status, admin_note: string) => {
    const res = await apiFetch(`/api/v1/admin/register-restaurant/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note, is_checked: true }),
    });
    if (!res.ok) throw new Error("Failed to update status.");
    const updated: Application = await res.json();
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    if (selectedApp?.id === id) setSelectedApp(updated);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    await apiFetch(`/api/v1/admin/register-restaurant/${id}/`, { method: "DELETE" });
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setCount((c) => c - 1);
    if (selectedApp?.id === id) setSelectedApp(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf8f5]">
    

      <div className="max-w-screen-xl mx-auto px-4 py-10">
       
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#513012]">Restaurant Applications</h1>
          <p className="text-[#776552] mt-1">
            {count} total application{count !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#d4b78f] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, city, owner…"
                className="flex-1 px-3 py-2 text-sm border border-[#d4b78f] rounded-lg bg-white text-[#3a2a1a] placeholder:text-[#b8a898] focus:outline-none focus:border-[#8c6d46] transition"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-[#513012] text-white rounded-lg hover:bg-[#7a4b2a] transition"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                  className="px-3 py-2 text-sm text-[#776552] border border-[#d4b78f] rounded-lg hover:bg-[#fdf5ec] transition"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Status filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#776552]">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as Status | ""); setPage(1); }}
                className="px-3 py-2 text-sm border border-[#d4b78f] rounded-lg bg-white text-[#3a2a1a] focus:outline-none focus:border-[#8c6d46] transition"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                ))}
              </select>
            </div>

            {/* Ordering */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#776552]">Sort by</label>
              <select
                value={ordering}
                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-[#d4b78f] rounded-lg bg-white text-[#3a2a1a] focus:outline-none focus:border-[#8c6d46] transition"
              >
                <option value="-created_on">Newest first</option>
                <option value="created_on">Oldest first</option>
                <option value="restaurant_name">Name A–Z</option>
                <option value="-restaurant_name">Name Z–A</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#d4b78f] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#8c6d46] text-sm">
              Loading applications…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-600 text-sm">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-[#8c6d46] text-sm">
              No applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ead9c5] bg-[#fdf5ec]">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#8c6d46]">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#8c6d46]">
                      Restaurant
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#8c6d46] hidden md:table-cell">
                      Owner
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#8c6d46] hidden lg:table-cell">
                      Location
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#8c6d46]">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#8c6d46] hidden md:table-cell">
                      Submitted
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ead9c5]">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-[#fdf5ec] transition cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="px-4 py-3 text-[#8c6d46] font-mono text-xs">{app.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#3a2a1a]">{app.restaurant_name}</p>
                        <p className="text-xs text-[#8c6d46]">{app.cuisine_type}</p>
                      </td>
                      <td className="px-4 py-3 text-[#3a2a1a] hidden md:table-cell">
                        <p>{app.owner_name}</p>
                        <p className="text-xs text-[#8c6d46]">{app.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-[#3a2a1a] hidden lg:table-cell">
                        {app.city}{app.area ? `, ${app.area}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status]?.badge}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {STATUS_STYLES[app.status]?.label ?? app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#8c6d46] hidden md:table-cell">
                        {new Date(app.created_on).toLocaleDateString()}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-3 py-1.5 text-xs text-[#513012] border border-[#d4b78f] rounded-lg hover:bg-[#fdf5ec] transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
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
            <p className="text-[#8c6d46] text-xs">
              Page {page} of {totalPages} · {count} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs text-[#776552] border border-[#d4b78f] rounded-lg hover:bg-[#fdf5ec] disabled:opacity-40 transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs text-[#776552] border border-[#d4b78f] rounded-lg hover:bg-[#fdf5ec] disabled:opacity-40 transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedApp && (
        <DetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-[#d4b78f] rounded-xl p-5">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c6d46] mb-3 pb-3 border-b border-[#ead9c5]">
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-2">{children}</div>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-[#8c6d46]">{label}</p>
    <p className="text-sm text-[#3a2a1a] font-medium">{value}</p>
  </div>
);

export default RestaurantApplications;