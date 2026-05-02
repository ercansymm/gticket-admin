"use client";

import { use } from "react";
import BlogPostForm from "@/components/blog/BlogPostForm";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = use(params);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Blog Yazısını Düzenle
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Mevcut blog yazısını güncelleyin.
        </p>
      </div>
      <BlogPostForm postId={Number(id)} />
    </div>
  );
}
