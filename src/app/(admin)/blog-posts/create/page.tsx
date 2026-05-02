"use client";

import BlogPostForm from "@/components/blog/BlogPostForm";

export default function CreateBlogPostPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Yeni Blog Yazısı
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Türkçe ve İngilizce içerik girerek yeni bir blog yazısı oluşturun.
        </p>
      </div>
      <BlogPostForm />
    </div>
  );
}
