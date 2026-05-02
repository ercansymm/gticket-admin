"use client";

import BlogPostsTable from "@/components/blog/BlogPostsTable";

export default function BlogPostsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Blog Yazıları
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Blog yazılarını oluşturun, düzenleyin ve yayınlayın.
        </p>
      </div>
      <BlogPostsTable />
    </div>
  );
}
