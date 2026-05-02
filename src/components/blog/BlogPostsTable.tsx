"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { blogApi, BlogPostDto } from "@/lib/blog";

export default function BlogPostsTable() {
  const [posts, setPosts] = useState<BlogPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogApi.list();
      setPosts(data);
    } catch {
      setError("Blog yazıları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) return;
    try {
      setDeletingId(id);
      await blogApi.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Silme işlemi başarısız oldu.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {posts.length} yazı
        </span>
        <Link
          href="/blog-posts/create"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          + Yeni Yazı
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-base font-medium">Henüz blog yazısı yok</p>
          <p className="mt-1 text-sm">Yukarıdan yeni bir yazı oluşturun.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Başlık (TR)</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Etiket</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Yazar</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Durum</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Tarih</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-xs">
                      {post.titleTr}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{post.tagTr}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{post.author}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.isPublished
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {post.isPublished ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(post.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog-posts/${post.id}/edit`}
                        className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.titleTr)}
                        disabled={deletingId === post.id}
                        className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        {deletingId === post.id ? "Siliniyor..." : "Sil"}
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
  );
}
