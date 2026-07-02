"use client";

import { useEffect, useState, useRef } from "react";
import type { CSSProperties } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const ADVERTISER_ENDPOINT = "/api/v1/advertiser/";
const ILLUSTRATION_ENDPOINT = "/api/v1/illustration/";


const ENABLED_FIELD = "enabled";

// ─── API helpers ────────────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

  const isFormData = options.body instanceof FormData;

 
const headers: Record<string, string> = {
  Authorization: `Bearer ${token}`,
  ...(options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : (options.headers as Record<string, string> || {})),
};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  console.log(`📡 ${options.method || 'GET'} ${API}${path}`);

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  console.log(`📊 Status: ${res.status}`);

  if (!res.ok) {
    let errorMessage = `API error ${res.status}`;
    const resClone = res.clone();

    try {
      const errorData = await res.json();
      console.error("❌ API Error Details (JSON):", errorData);
      errorMessage =
        errorData.message ||
        errorData.errors?.detail ||
        errorData.detail ||
        JSON.stringify(errorData) ||
        errorMessage;
    } catch (e) {
      try {
        const raw = await resClone.text();
        console.error("❌ Raw error body (non-JSON):", raw);
        const excMatch = raw.match(/<pre class="exception_value">([\s\S]*?)<\/pre>/i);
        const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/i);
        if (excMatch) {
          errorMessage = excMatch[1].replace(/<[^>]+>/g, "").trim();
        } else if (titleMatch) {
          errorMessage = titleMatch[1].replace(/<[^>]+>/g, "").trim();
        } else if (raw) {
          errorMessage = raw.slice(0, 300);
        }
      } catch (textErr) {
        console.error("❌ Could not read error response body at all");
      }
    }

    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface Advertiser {
  id: number;
  title_en: string;
  title_ne?: string;
  created_on?: string;
}

interface Illustration {
  id: number;
  image: string;
  alt: string;
  external_link: string;
  advertiser?: Advertiser | number | null;
  enabled?: boolean;
  updated_on?: string;
}

// ─── Toast Component ──────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: type === "error" ? "#fee2e2" : "#dcfce7",
      color: type === "error" ? "#991b1b" : "#166534",
      border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}`,
      borderRadius: 10, padding: "14px 24px", fontSize: 14, fontWeight: 500,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      maxWidth: 480,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }}>
      {message}
    </div>
  );
}

// ─── Modal Component ──────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500, background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e2e8f0",
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8", lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Toggle Switch ──────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 42, height: 24, borderRadius: 999, border: "none",
        background: checked ? "#22c55e" : "#cbd5e1",
        position: "relative", cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s", flexShrink: 0, padding: 0,
        opacity: disabled ? 0.6 : 1,
      }}
      aria-label={checked ? "Enabled" : "Disabled"}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

// ─── Illustration Form ────────────────────────────────────────────────────
function IllustrationForm({
  initial,
  advertisers,
  advertisersLoading,
  onSave,
  onClose,
}: {
  initial: Illustration | null;
  advertisers: Advertiser[];
  advertisersLoading: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [alt, setAlt] = useState(initial?.alt || "");
  const [externalLink, setExternalLink] = useState(initial?.external_link || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.image || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initialAdvertiserId =
    initial?.advertiser && typeof initial.advertiser === "object"
      ? initial.advertiser.id
      : (initial?.advertiser as number | undefined) || "";
  const [advertiserId, setAdvertiserId] = useState<string>(
    initialAdvertiserId ? String(initialAdvertiserId) : ""
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!initial && !imageFile) {
      setError("Please select an image to upload");
      return;
    }
    if (!advertiserId) {
      setError("Please select an advertiser");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("alt", alt);
      formData.append("external_link", externalLink);
      formData.append("advertiser", advertiserId);

      console.log("📤 Sending FormData:");
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]}`);
      }

      let response;
      if (initial) {
        response = await apiFetch(`${ILLUSTRATION_ENDPOINT}${initial.id}/`, {
          method: "PUT",
          body: formData,
        });
        console.log("✅ Updated successfully:", response);
      } else {
        response = await apiFetch(ILLUSTRATION_ENDPOINT, {
          method: "POST",
          body: formData,
        });
        console.log("✅ Created successfully:", response);
      }

      onSave();
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div>
      {error && (
        <div style={{
          padding: "12px 16px", background: "#fee2e2", color: "#991b1b",
          borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca",
          whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 200, overflowY: "auto",
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          {initial ? "Replace Image (optional)" : "Image *"}
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${preview ? "#22c55e" : "#e2e8f0"}`,
            borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer",
            background: preview ? "#f0fdf4" : "#f8fafc", minHeight: 120,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ maxHeight: 140, maxWidth: "100%", borderRadius: 6, objectFit: "contain" }} />
          ) : (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              Click to select an image
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: "none" }} onChange={handleFileChange} />
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>
          JPG, PNG, GIF, WebP • Max 5MB
          {preview && !initial && <span style={{ color: "#22c55e", marginLeft: 8 }}>✓ Image selected</span>}
        </p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          Advertiser *
        </label>
        <select
          value={advertiserId}
          onChange={(e) => setAdvertiserId(e.target.value)}
          disabled={advertisersLoading}
          style={inputStyle}
        >
          <option value="">
            {advertisersLoading ? "Loading advertisers..." : "Select an advertiser"}
          </option>
          {advertisers.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title_en || a.title_ne || `Advertiser #${a.id}`}
            </option>
          ))}
        </select>
        {!advertisersLoading && advertisers.length === 0 && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#dc2626" }}>
            No advertisers yet. Switch to the "Advertisers" tab to add one first.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          Alt Text
        </label>
        <input style={inputStyle} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Summer sale banner" />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          External Link URL
        </label>
        <input style={inputStyle} value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://example.com" type="url" />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
        <button
          onClick={onClose}
          style={{ padding: "10px 24px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14, color: "#374151" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: "10px 28px", border: "none", borderRadius: 8,
            background: saving ? "#94a3b8" : "#1e293b", color: "#fff",
            cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500,
          }}
        >
          {saving ? "Saving..." : initial ? "Update Banner" : "Create Banner"}
        </button>
      </div>
    </div>
  );
}

// ─── Advertiser Form ──────────────────────────────────────────────────────
function AdvertiserForm({ initial, onSave, onClose }: { initial: Advertiser | null; onSave: () => void; onClose: () => void }) {
  const [titleEn, setTitleEn] = useState(initial?.title_en || "");
  const [titleNe, setTitleNe] = useState(initial?.title_ne || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!titleEn.trim()) {
      setError("Title (English) is required");
      return;
    }

    setSaving(true);
    try {
      const payload = { title_en: titleEn, title_ne: titleNe };
      if (initial) {
        await apiFetch(`${ADVERTISER_ENDPOINT}${initial.id}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(ADVERTISER_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save advertiser");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", boxSizing: "border-box",
  };

  return (
    <div>
      {error && (
        <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#991b1b", borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca" }}>
          ⚠️ {error}
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          Title (English) *
        </label>
        <input style={inputStyle} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="e.g. Coca-Cola" />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          Title (Nepali)
        </label>
        <input style={inputStyle} value={titleNe} onChange={(e) => setTitleNe(e.target.value)} placeholder="e.g. कोका-कोला" />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
        <button onClick={onClose} style={{ padding: "10px 24px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14, color: "#374151" }}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ padding: "10px 28px", border: "none", borderRadius: 8, background: saving ? "#94a3b8" : "#1e293b", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500 }}
        >
          {saving ? "Saving..." : initial ? "Update Advertiser" : "Create Advertiser"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AdminIllustrationsPage() {
  const [tab, setTab] = useState<"banners" | "advertisers">("banners");

  // Illustrations
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedItem, setSelectedItem] = useState<Illustration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Illustration | null>(null);

  // Advertisers
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(true);
  const [advModalMode, setAdvModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [advDeleteTarget, setAdvDeleteTarget] = useState<Advertiser | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });

  const loadIllustrations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${ILLUSTRATION_ENDPOINT}?page_size=100`);
      setIllustrations(data?.results || data || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load illustrations", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadAdvertisers = async () => {
    setAdvertisersLoading(true);
    try {
      const data = await apiFetch(`${ADVERTISER_ENDPOINT}?page_size=200`);
      setAdvertisers(data?.results || data || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load advertisers", "error");
    } finally {
      setAdvertisersLoading(false);
    }
  };

  useEffect(() => {
    loadIllustrations();
    loadAdvertisers();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`${ILLUSTRATION_ENDPOINT}${deleteTarget.id}/`, { method: "DELETE" });
      showToast("Banner deleted successfully");
      setDeleteTarget(null);
      loadIllustrations();
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    }
  };

  const handleDeleteAdvertiser = async () => {
    if (!advDeleteTarget) return;
    try {
      await apiFetch(`${ADVERTISER_ENDPOINT}${advDeleteTarget.id}/`, { method: "DELETE" });
      showToast("Advertiser deleted successfully");
      setAdvDeleteTarget(null);
      loadAdvertisers();
    } catch (err: any) {
      showToast(err.message || "Failed to delete advertiser (it may still be used by a banner)", "error");
    }
  };

  const advertiserLabel = (adv?: Advertiser | number | null) => {
    if (!adv) return "—";
    if (typeof adv === "object") return adv.title_en || adv.title_ne || `#${adv.id}`;
    const found = advertisers.find((a) => a.id === adv);
    return found ? found.title_en : `#${adv}`;
  };

  const styles = {
    page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    container: { maxWidth: 1000, margin: "0 auto", padding: "40px 20px" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 },
    title: { margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" },
    subtitle: { margin: "4px 0 0", fontSize: 14, color: "#64748b" },
    addButton: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "#1e293b", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" },
    tabs: { display: "flex", gap: 4, marginBottom: 24, background: "#f1f5f9", padding: 4, borderRadius: 10, width: "fit-content" },
    tabButton: (active: boolean): CSSProperties => ({
      padding: "8px 20px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer",
      background: active ? "#fff" : "transparent", color: active ? "#0f172a" : "#64748b",
      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    }),
    card: { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    row: { display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: "1px solid #f1f5f9" },
    thumbnail: { width: 100, height: 56, objectFit: "cover", borderRadius: 6, background: "#f1f5f9", flexShrink: 0 },
    info: { flex: 1, minWidth: 0 },
    altText: { margin: 0, fontSize: 14, fontWeight: 500, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    link: { margin: "2px 0 0", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    metaRow: { margin: "2px 0 0", fontSize: 12, color: "#94a3b8", display: "flex", gap: 10, flexWrap: "wrap" },
    actions: { display: "flex", gap: 8, alignItems: "center", flexShrink: 0 },
    actionButton: (color?: "red") => ({
      padding: "6px 14px", border: `1px solid ${color === "red" ? "#fecaca" : "#e2e8f0"}`, borderRadius: 6,
      background: color === "red" ? "#fef2f2" : "#f8fafc", color: color === "red" ? "#dc2626" : "#374151",
      fontSize: 12, fontWeight: 500, cursor: "pointer",
    }),
    badge: (on: boolean): CSSProperties => ({
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
      background: on ? "#dcfce7" : "#f1f5f9", color: on ? "#166534" : "#64748b",
    }),
    empty: { padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 14 },
  };

  return (
    <div style={styles.page as CSSProperties}>
      <div style={styles.container as CSSProperties}>
        <div style={styles.header as CSSProperties}>
          <div>
            <h1 style={styles.title as CSSProperties}>{tab === "banners" ? "Illustrations" : "Advertisers"}</h1>
            <p style={styles.subtitle as CSSProperties}>
              {tab === "banners" ? "Manage banner images for your homepage" : "Manage advertiser records used by banners"}
            </p>
          </div>
          <button
            style={styles.addButton as CSSProperties}
            onClick={() => {
              if (tab === "banners") {
                setSelectedItem(null);
                setModalMode("create");
              } else {
                setSelectedAdvertiser(null);
                setAdvModalMode("create");
              }
            }}
          >
            <span style={{ fontSize: 18 }}>+</span> {tab === "banners" ? "Add Banner" : "Add Advertiser"}
          </button>
        </div>

        <div style={styles.tabs as CSSProperties}>
          <button style={styles.tabButton(tab === "banners")} onClick={() => setTab("banners")}>Banners</button>
          <button style={styles.tabButton(tab === "advertisers")} onClick={() => setTab("advertisers")}>Advertisers</button>
        </div>

        {tab === "banners" ? (
          loading ? (
            <div style={styles.empty as CSSProperties}>Loading...</div>
          ) : (
            <div style={styles.card as CSSProperties}>
              {illustrations.length === 0 ? (
                <div style={styles.empty as CSSProperties}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
                  <p style={{ margin: 0 }}>No banners yet. Click "Add Banner" to create one.</p>
                </div>
              ) : (
                illustrations.map((item) => (
                  <div key={item.id} style={styles.row as CSSProperties}>
                    <img
                      src={`${item.image}${item.image.includes("?") ? "&" : "?"}v=${encodeURIComponent(item.updated_on || String(item.id))}`}
                      alt={item.alt || "banner"}
                      style={styles.thumbnail as CSSProperties}
                    />
                    <div style={styles.info as CSSProperties}>
                      <p style={styles.altText as CSSProperties}>{item.alt || "Untitled banner"}</p>
                      {item.external_link && <p style={styles.link as CSSProperties}>{item.external_link}</p>}
                      <div style={styles.metaRow as CSSProperties}>
                        <span>ID: {item.id}</span>
                        <span>Advertiser: {advertiserLabel(item.advertiser)}</span>
                      </div>
                    </div>
                    <div style={styles.actions as CSSProperties}>
                      <button style={styles.actionButton()} onClick={() => { setSelectedItem(item); setModalMode("edit"); }}>
                        Edit
                      </button>
                      <button style={styles.actionButton("red")} onClick={() => setDeleteTarget(item)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        ) : advertisersLoading ? (
          <div style={styles.empty as CSSProperties}>Loading...</div>
        ) : (
          <div style={styles.card as CSSProperties}>
            {advertisers.length === 0 ? (
              <div style={styles.empty as CSSProperties}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
                <p style={{ margin: 0 }}>No advertisers yet. Click "Add Advertiser" to create one.</p>
              </div>
            ) : (
              advertisers.map((adv) => (
                <div key={adv.id} style={styles.row as CSSProperties}>
                  <div style={styles.info as CSSProperties}>
                    <p style={styles.altText as CSSProperties}>{adv.title_en}</p>
                    {adv.title_ne && <p style={styles.link as CSSProperties}>{adv.title_ne}</p>}
                    <p style={styles.metaRow as CSSProperties}>ID: {adv.id}</p>
                  </div>
                  <div style={styles.actions as CSSProperties}>
                    <button style={styles.actionButton()} onClick={() => { setSelectedAdvertiser(adv); setAdvModalMode("edit"); }}>
                      Edit
                    </button>
                    <button style={styles.actionButton("red")} onClick={() => setAdvDeleteTarget(adv)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Banner Modal */}
      {modalMode && (
        <Modal
          title={modalMode === "create" ? "Create New Banner" : "Edit Banner"}
          onClose={() => { setModalMode(null); setSelectedItem(null); }}
        >
          <IllustrationForm
            initial={selectedItem}
            advertisers={advertisers}
            advertisersLoading={advertisersLoading}
            onSave={() => {
              setModalMode(null);
              setSelectedItem(null);
              showToast(selectedItem ? "Banner updated!" : "Banner created!");
              loadIllustrations();
            }}
            onClose={() => { setModalMode(null); setSelectedItem(null); }}
          />
        </Modal>
      )}

      {/* Delete Banner Confirmation */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <div>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#374151" }}>
              Are you sure you want to delete "<strong>{deleteTarget.alt || "Untitled"}</strong>"?
              <br />
              <span style={{ color: "#94a3b8", fontSize: 13 }}>
                This removes it from the homepage immediately and cannot be undone.
              </span>
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={handleDelete} style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Advertiser Modal */}
      {advModalMode && (
        <Modal
          title={advModalMode === "create" ? "Add Advertiser" : "Edit Advertiser"}
          onClose={() => { setAdvModalMode(null); setSelectedAdvertiser(null); }}
        >
          <AdvertiserForm
            initial={selectedAdvertiser}
            onSave={() => {
              setAdvModalMode(null);
              setSelectedAdvertiser(null);
              showToast(selectedAdvertiser ? "Advertiser updated!" : "Advertiser created!");
              loadAdvertisers();
            }}
            onClose={() => { setAdvModalMode(null); setSelectedAdvertiser(null); }}
          />
        </Modal>
      )}

      {/* Delete Advertiser Confirmation */}
      {advDeleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setAdvDeleteTarget(null)}>
          <div>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#374151" }}>
              Are you sure you want to delete "<strong>{advDeleteTarget.title_en}</strong>"?
              <br />
              <span style={{ color: "#94a3b8", fontSize: 13 }}>
                This will fail if any banner still uses this advertiser.
              </span>
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setAdvDeleteTarget(null)} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={handleDeleteAdvertiser} style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}