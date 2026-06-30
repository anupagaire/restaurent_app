"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "";

// ─── API helpers ────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ active }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 20,
        background: active ? "#dcfce7" : "#f1f5f9",
        color: active ? "#166534" : "#64748b",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: active ? "#22c55e" : "#94a3b8",
          display: "inline-block",
        }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        background: type === "error" ? "#fee2e2" : "#dcfce7",
        color: type === "error" ? "#991b1b" : "#166534",
        border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}`,
        borderRadius: 10,
        padding: "12px 20px",
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {message}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#94a3b8",
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{hint}</p>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  color: "#0f172a",
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
};

// ─── Ad Form ─────────────────────────────────────────────────────────────────

function AdForm({ advertisers, initial, onSave, onClose }) {
  const [form, setForm] = useState({
    advertiser: initial?.advertiser?.id || "",
    alt: initial?.alt || "",
    external_link: initial?.external_link || "",
    is_active: initial?.is_active ?? false,
    image: null,
  });
  const [preview, setPreview] = useState(initial?.image || null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("image", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.advertiser) return alert("Please select an advertiser.");
    if (!initial && !form.image) return alert("Please upload a banner image.");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("advertiser", form.advertiser);
      fd.append("alt", form.alt);
      fd.append("external_link", form.external_link);
      fd.append("is_active", form.is_active);
      if (form.image) fd.append("image", form.image);

      if (initial) {
        await apiFetch(`/api/v1/advertisement/${initial.id}/`, {
          method: "PATCH",
          body: fd,
        });
      } else {
        await apiFetch(`/api/v1/advertisement/`, {
          method: "POST",
          body: fd,
        });
      }
      onSave();
    } catch (err) {
      alert("Failed to save. Check console.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Field label="Advertiser *">
        <select
          style={{ ...inputStyle }}
          value={form.advertiser}
          onChange={(e) => set("advertiser", e.target.value)}
        >
          <option value="">Select advertiser…</option>
          {advertisers.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title_en}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Banner image *" hint={initial ? "Leave empty to keep existing image" : ""}>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: "2px dashed #e2e8f0",
            borderRadius: 10,
            padding: 16,
            textAlign: "center",
            cursor: "pointer",
            background: "#f8fafc",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{ maxHeight: 140, maxWidth: "100%", borderRadius: 6, objectFit: "cover" }}
            />
          ) : (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
              Click to upload banner image
              <br />
              <span style={{ fontSize: 11 }}>JPG, PNG, WEBP</span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </Field>

      <Field label="Alt text" hint="Shown if image fails to load">
        <input
          style={inputStyle}
          value={form.alt}
          onChange={(e) => set("alt", e.target.value)}
          placeholder="e.g. Summer sale banner"
        />
      </Field>

      <Field label="External link URL" hint="Where clicking the ad takes the user">
        <input
          style={inputStyle}
          value={form.external_link}
          onChange={(e) => set("external_link", e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </Field>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "#f8fafc",
          borderRadius: 10,
          marginBottom: 24,
          border: "1px solid #e2e8f0",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
            Active
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
            Show this ad on the homepage
          </p>
        </div>
        <div
          onClick={() => set("is_active", !form.is_active)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: form.is_active ? "#22c55e" : "#e2e8f0",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              left: form.is_active ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.2s",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            padding: "9px 20px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
            color: "#374151",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: "9px 22px",
            border: "none",
            borderRadius: 8,
            background: saving ? "#94a3b8" : "#1e293b",
            color: "#fff",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {saving ? "Saving…" : initial ? "Update ad" : "Create ad"}
        </button>
      </div>
    </>
  );
}

// ─── Advertiser Form ──────────────────────────────────────────────────────────

function AdvertiserForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title_en: initial?.title_en || "",
    title_ne: initial?.title_ne || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title_en.trim()) return alert("English title is required.");
    setSaving(true);
    try {
      if (initial) {
        await apiFetch(`/api/v1/advertisers/${initial.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch(`/api/v1/advertisers/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      onSave();
    } catch (err) {
      alert("Failed to save advertiser.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Field label="Title (English) *">
        <input
          style={inputStyle}
          value={form.title_en}
          onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
          placeholder="e.g. Nike Nepal"
        />
      </Field>
      <Field label="Title (Nepali)">
        <input
          style={inputStyle}
          value={form.title_ne}
          onChange={(e) => setForm((f) => ({ ...f, title_ne: e.target.value }))}
          placeholder="e.g. नाइक नेपाल"
        />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button
          onClick={onClose}
          style={{
            padding: "9px 20px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
            color: "#374151",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: "9px 22px",
            border: "none",
            borderRadius: 8,
            background: saving ? "#94a3b8" : "#1e293b",
            color: "#fff",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {saving ? "Saving…" : initial ? "Update" : "Create"}
        </button>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAdsPage() {
  const [tab, setTab] = useState("ads"); // "ads" | "advertisers"
  const [ads, setAds] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [adModal, setAdModal] = useState(null);       // null | "create" | ad object
  const [advModal, setAdvModal] = useState(null);     // null | "create" | advertiser object
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [adsData, advData] = await Promise.all([
        apiFetch("/api/v1/advertisement/"),
        apiFetch("/api/v1/advertisers/"),
      ]);
      setAds(adsData?.results || adsData || []);
      setAdvertisers(advData?.results || advData || []);
    } catch (err) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const toggleActive = async (ad) => {
    try {
      const fd = new FormData();
      fd.append("is_active", !ad.is_active);
      await apiFetch(`/api/v1/advertisement/${ad.id}/`, { method: "PATCH", body: fd });
      setAds((prev) =>
        prev.map((a) => (a.id === ad.id ? { ...a, is_active: !a.is_active } : a))
      );
      showToast(`Ad ${!ad.is_active ? "activated" : "deactivated"}`);
    } catch {
      showToast("Failed to toggle status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const isAd = deleteTarget.type === "ad";
      await apiFetch(
        isAd
          ? `/api/v1/advertisement/${deleteTarget.id}/`
          : `/api/v1/advertisers/${deleteTarget.id}/`,
        { method: "DELETE" }
      );
      showToast(`${isAd ? "Ad" : "Advertiser"} deleted`);
      setDeleteTarget(null);
      loadAll();
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const s = {
    page: { minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, sans-serif" },
    inner: { maxWidth: 900, margin: "0 auto", padding: "32px 16px" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
    title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" },
    tabs: { display: "flex", gap: 4, background: "#e2e8f0", borderRadius: 10, padding: 4, marginBottom: 24 },
    tab: (active) => ({
      flex: 1,
      padding: "8px 0",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
      background: active ? "#fff" : "transparent",
      color: active ? "#0f172a" : "#64748b",
      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
      transition: "all 0.15s",
    }),
    card: {
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      overflow: "hidden",
    },
    addBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "9px 18px",
      background: "#1e293b",
      color: "#fff",
      border: "none",
      borderRadius: 9,
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
    },
    row: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 20px",
      borderBottom: "1px solid #f1f5f9",
    },
    thumb: { width: 80, height: 44, objectFit: "cover", borderRadius: 6, background: "#f1f5f9", flexShrink: 0 },
    actionBtn: (color) => ({
      padding: "5px 12px",
      border: `1px solid ${color === "red" ? "#fecaca" : "#e2e8f0"}`,
      borderRadius: 7,
      background: color === "red" ? "#fff1f2" : "#f8fafc",
      color: color === "red" ? "#dc2626" : "#374151",
      fontSize: 12,
      fontWeight: 500,
      cursor: "pointer",
    }),
    empty: { padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 },
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Advertisement</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Manage banners and advertisers
            </p>
          </div>
          <button
            style={s.addBtn}
            onClick={() => tab === "ads" ? setAdModal("create") : setAdvModal("create")}
          >
            + Add {tab === "ads" ? "banner" : "advertiser"}
          </button>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tab(tab === "ads")} onClick={() => setTab("ads")}>
            Banners ({ads.length})
          </button>
          <button style={s.tab(tab === "advertisers")} onClick={() => setTab("advertisers")}>
            Advertisers ({advertisers.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={s.empty}>Loading…</div>
        ) : tab === "ads" ? (
          <div style={s.card}>
            {ads.length === 0 ? (
              <div style={s.empty}>No banners yet. Add one above.</div>
            ) : (
              ads.map((ad) => (
                <div key={ad.id} style={s.row}>
                  {/* Thumbnail */}
                  <img src={ad.image} alt={ad.alt || "banner"} style={s.thumb} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ad.advertiser?.title_en || "—"}
                    </p>
                    {ad.external_link && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ad.external_link}
                      </p>
                    )}
                  </div>

                  {/* Badge */}
                  <Badge active={ad.is_active} />

                  {/* Toggle */}
                  <div
                    onClick={() => toggleActive(ad)}
                    title={ad.is_active ? "Deactivate" : "Activate"}
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 11,
                      background: ad.is_active ? "#22c55e" : "#e2e8f0",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: ad.is_active ? 21 : 3,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transition: "left 0.2s",
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button style={s.actionBtn()} onClick={() => setAdModal(ad)}>
                      Edit
                    </button>
                    <button
                      style={s.actionBtn("red")}
                      onClick={() => setDeleteTarget({ type: "ad", id: ad.id, name: ad.advertiser?.title_en })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={s.card}>
            {advertisers.length === 0 ? (
              <div style={s.empty}>No advertisers yet. Add one above.</div>
            ) : (
              advertisers.map((adv) => (
                <div key={adv.id} style={s.row}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    {adv.title_en?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                      {adv.title_en}
                    </p>
                    {adv.title_ne && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                        {adv.title_ne}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={s.actionBtn()} onClick={() => setAdvModal(adv)}>
                      Edit
                    </button>
                    <button
                      style={s.actionBtn("red")}
                      onClick={() => setDeleteTarget({ type: "advertiser", id: adv.id, name: adv.title_en })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Ad Modal */}
      {adModal && (
        <Modal
          title={adModal === "create" ? "Add banner" : "Edit banner"}
          onClose={() => setAdModal(null)}
        >
          <AdForm
            advertisers={advertisers}
            initial={adModal === "create" ? null : adModal}
            onSave={() => {
              setAdModal(null);
              showToast(adModal === "create" ? "Banner created!" : "Banner updated!");
              loadAll();
            }}
            onClose={() => setAdModal(null)}
          />
        </Modal>
      )}

      {/* Advertiser Modal */}
      {advModal && (
        <Modal
          title={advModal === "create" ? "Add advertiser" : "Edit advertiser"}
          onClose={() => setAdvModal(null)}
        >
          <AdvertiserForm
            initial={advModal === "create" ? null : advModal}
            onSave={() => {
              setAdvModal(null);
              showToast(advModal === "create" ? "Advertiser created!" : "Advertiser updated!");
              loadAll();
            }}
            onClose={() => setAdvModal(null)}
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal title="Confirm delete" onClose={() => setDeleteTarget(null)}>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#374151" }}>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget.name}</strong>? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{
                padding: "9px 20px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: "9px 20px",
                border: "none",
                borderRadius: 8,
                background: "#dc2626",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}