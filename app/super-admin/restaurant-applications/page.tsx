"use client";

import { useEffect, useState } from "react";
import { PhoneCall, Mail, MapPin, Clock, ChevronDown, ChevronUp, Search, RefreshCw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RestaurantApplication {
  id: string;
  restaurantName: string;
  cuisineType: string;
  city: string;
  area: string;
  fullAddress?: string;
  description?: string;
  ownerName: string;
  phone: string;
  email: string;
  whatsapp?: string;
  openingTime?: string;
  closingTime?: string;
  seatingCapacity?: string;
  hasDelivery: string;
  panVat?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

type Status = "all" | "pending" | "approved" | "rejected";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-green-50 text-green-700 border border-green-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

// ─── Component ────────────────────────────────────────────────────────────────
const RestaurantApplications = () => {
  const [applications, setApplications] = useState<RestaurantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // ── Replace with actual API endpoint from your senior ──
      const res = await fetch("/api/restaurant-applications");
      if (!res.ok) throw new Error("Failed to fetch applications.");
      const data: RestaurantApplication[] = await res.json();
      setApplications(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ── Update status (approve / reject) ─────────────────────────────────────
  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      // ── Replace with actual PATCH/PUT endpoint ──
      const res = await fetch(`/api/restaurant-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      app.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf8f5] px-4 py-8">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#513012]">Restaurant applications</h1>
            <p className="text-sm text-[#776552] mt-1">
              {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
            </p>
          </div>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-[#d4b78f] rounded-lg text-[#776552] hover:bg-[#fdf5ec] transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a898]" />
            <input
              type="text"
              placeholder="Search by name, owner, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#d4b78f] rounded-lg bg-white text-[#3a2a1a] placeholder:text-[#b8a898] focus:outline-none focus:border-[#8c6d46]"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition border ${
                  statusFilter === s
                    ? "bg-[#513012] text-white border-[#513012]"
                    : "bg-white text-[#776552] border-[#d4b78f] hover:bg-[#fdf5ec]"
                }`}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {/* Loading / error */}
        {loading && (
          <div className="text-center py-16 text-[#776552]">Loading applications…</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-[#b8a898]">No applications found.</div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white border border-[#d4b78f] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ead9c5] bg-[#fdf5ec]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8c6d46] uppercase tracking-wider">Restaurant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8c6d46] uppercase tracking-wider hidden md:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8c6d46] uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8c6d46] uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8c6d46] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8c6d46] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <>
                    <tr
                      key={app.id}
                      className="border-b border-[#f0e6d6] hover:bg-[#fdf9f4] cursor-pointer transition"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#3a2a1a]">{app.restaurantName}</p>
                        <p className="text-xs text-[#b8a898]">{app.cuisineType}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[#776552]">{app.ownerName}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[#776552]">{app.city}, {app.area}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#b8a898]">
                        {new Date(app.createdAt).toLocaleDateString("en-NP", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[app.status]}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "approved"); }}
                                disabled={updatingId === app.id}
                                className="px-2.5 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "rejected"); }}
                                disabled={updatingId === app.id}
                                className="px-2.5 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {expandedId === app.id
                            ? <ChevronUp className="w-4 h-4 text-[#b8a898]" />
                            : <ChevronDown className="w-4 h-4 text-[#b8a898]" />
                          }
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expandedId === app.id && (
                      <tr key={`${app.id}-detail`} className="bg-[#fdf9f4]">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-[#8c6d46] mb-2">Contact</p>
                              <div className="flex items-center gap-2 text-[#776552]">
                                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                                <span>{app.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#776552]">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span>{app.email}</span>
                              </div>
                              {app.whatsapp && (
                                <p className="text-[#b8a898] text-xs">WhatsApp: {app.whatsapp}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-[#8c6d46] mb-2">Location</p>
                              <div className="flex items-start gap-2 text-[#776552]">
                                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{[app.fullAddress, app.area, app.city].filter(Boolean).join(", ")}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-[#8c6d46] mb-2">Operations</p>
                              {app.openingTime && app.closingTime && (
                                <div className="flex items-center gap-2 text-[#776552]">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  <span>{app.openingTime} – {app.closingTime}</span>
                                </div>
                              )}
                              <p className="text-[#776552]">Delivery: {app.hasDelivery}</p>
                              {app.seatingCapacity && <p className="text-[#776552]">Seats: {app.seatingCapacity}</p>}
                              {app.panVat && <p className="text-[#776552]">PAN/VAT: {app.panVat}</p>}
                            </div>
                          </div>

                          {app.description && (
                            <p className="mt-4 text-xs text-[#b8a898] italic border-t border-[#ead9c5] pt-3">
                              "{app.description}"
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantApplications;