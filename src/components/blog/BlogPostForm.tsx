"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { blogApi, BlogPostFormData } from "@/lib/blog";

const EMPTY_FORM: BlogPostFormData = {
  slug: "",
  titleTr: "", titleEn: "",
  summaryTr: "", summaryEn: "",
  contentTr: "", contentEn: "",
  thumbUrl: null,
  tagTr: "", tagEn: "",
  author: "",
  readTime: 5,
  metaTitleTr: "", metaTitleEn: "",
  metaDescriptionTr: "", metaDescriptionEn: "",
  keywordsTr: "", keywordsEn: "",
  isPublished: false,
};

interface BlogPostFormProps {
  postId?: number;
}

type Tab = "tr" | "en" | "seo";

export default function BlogPostForm({ postId }: BlogPostFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostFormData>(EMPTY_FORM);
  const [tab, setTab] = useState<Tab>("tr");
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!postId) return;
    blogApi.getById(postId)
      .then((post) => {
        setForm({
          slug: post.slug,
          titleTr: post.titleTr, titleEn: post.titleEn,
          summaryTr: post.summaryTr, summaryEn: post.summaryEn,
          contentTr: post.contentTr, contentEn: post.contentEn,
          thumbUrl: post.thumbUrl,
          tagTr: post.tagTr, tagEn: post.tagEn,
          author: post.author,
          readTime: post.readTime,
          metaTitleTr: post.metaTitleTr, metaTitleEn: post.metaTitleEn,
          metaDescriptionTr: post.metaDescriptionTr, metaDescriptionEn: post.metaDescriptionEn,
          keywordsTr: post.keywordsTr.join(", "),
          keywordsEn: post.keywordsEn.join(", "),
          isPublished: post.isPublished,
        });
      })
      .catch(() => setError("Blog yazısı yüklenemedi."))
      .finally(() => setLoading(false));
  }, [postId]);

  const set = (field: keyof BlogPostFormData, value: string | number | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await blogApi.uploadImage(file);
      set("thumbUrl", url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.trim() || !form.titleTr.trim()) {
      setError("Slug ve Türkçe başlık zorunludur.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (postId) {
        await blogApi.update(postId, form);
      } else {
        await blogApi.create(form);
      }
      router.push("/blog-posts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydetme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        Yükleniyor...
      </div>
    );
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Temel bilgiler */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Genel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
              placeholder="ucuz-ucak-bileti-ipuclari"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yazar
              </label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="AtaBilet Ekibi"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Okuma Süresi (dk)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={form.readTime}
                onChange={(e) => set("readTime", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Kapak görseli */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kapak Görseli
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {uploading ? "Yükleniyor..." : "Görsel Seç"}
            </button>
            {form.thumbUrl && (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.thumbUrl.startsWith("/") ? `${API_BASE_URL}${form.thumbUrl}` : form.thumbUrl}
                  alt="Kapak"
                  className="h-12 w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => set("thumbUrl", null)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Kaldır
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400">JPG, PNG veya WebP — maks. 5MB</p>
        </div>
      </div>

      {/* İçerik sekmeleri */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(["tr", "en", "seo"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {t === "tr" ? "Türkçe" : t === "en" ? "İngilizce" : "SEO"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {tab === "tr" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Başlık (TR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.titleTr}
                    onChange={(e) => set("titleTr", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Etiket (TR)
                  </label>
                  <input
                    type="text"
                    value={form.tagTr}
                    onChange={(e) => set("tagTr", e.target.value)}
                    placeholder="Seyahat İpuçları"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Özet (TR)
                </label>
                <textarea
                  rows={3}
                  value={form.summaryTr}
                  onChange={(e) => set("summaryTr", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İçerik (TR) — HTML destekler
                </label>
                <textarea
                  rows={16}
                  value={form.contentTr}
                  onChange={(e) => set("contentTr", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                />
              </div>
            </>
          )}

          {tab === "en" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    value={form.titleEn}
                    onChange={(e) => set("titleEn", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tag (EN)
                  </label>
                  <input
                    type="text"
                    value={form.tagEn}
                    onChange={(e) => set("tagEn", e.target.value)}
                    placeholder="Travel Tips"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Summary (EN)
                </label>
                <textarea
                  rows={3}
                  value={form.summaryEn}
                  onChange={(e) => set("summaryEn", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content (EN) — HTML supported
                </label>
                <textarea
                  rows={16}
                  value={form.contentEn}
                  onChange={(e) => set("contentEn", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                />
              </div>
            </>
          )}

          {tab === "seo" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta Başlık (TR)
                  </label>
                  <input
                    type="text"
                    value={form.metaTitleTr}
                    onChange={(e) => set("metaTitleTr", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta Title (EN)
                  </label>
                  <input
                    type="text"
                    value={form.metaTitleEn}
                    onChange={(e) => set("metaTitleEn", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta Açıklama (TR)
                  </label>
                  <textarea
                    rows={3}
                    value={form.metaDescriptionTr}
                    onChange={(e) => set("metaDescriptionTr", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta Description (EN)
                  </label>
                  <textarea
                    rows={3}
                    value={form.metaDescriptionEn}
                    onChange={(e) => set("metaDescriptionEn", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Anahtar Kelimeler TR <span className="text-gray-400 text-xs">(virgülle ayır)</span>
                  </label>
                  <input
                    type="text"
                    value={form.keywordsTr}
                    onChange={(e) => set("keywordsTr", e.target.value)}
                    placeholder="ucuz bilet, uçak bileti, seyahat"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Keywords EN <span className="text-gray-400 text-xs">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={form.keywordsEn}
                    onChange={(e) => set("keywordsEn", e.target.value)}
                    placeholder="cheap flights, airline tickets, travel"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alt butonlar */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 px-6 py-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set("isPublished", !form.isPublished)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.isPublished ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-600"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.isPublished ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {form.isPublished ? "Yayında" : "Taslak olarak kaydet"}
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/blog-posts")}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : postId ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </div>
    </form>
  );
}
