import { api } from "./api";

export interface BlogPostDto {
  id: number;
  slug: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  contentTr: string;
  contentEn: string;
  thumbUrl: string | null;
  tagTr: string;
  tagEn: string;
  author: string;
  readTime: number;
  metaTitleTr: string;
  metaTitleEn: string;
  metaDescriptionTr: string;
  metaDescriptionEn: string;
  keywordsTr: string[];
  keywordsEn: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostFormData {
  slug: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  contentTr: string;
  contentEn: string;
  thumbUrl: string | null;
  tagTr: string;
  tagEn: string;
  author: string;
  readTime: number;
  metaTitleTr: string;
  metaTitleEn: string;
  metaDescriptionTr: string;
  metaDescriptionEn: string;
  keywordsTr: string;
  keywordsEn: string;
  isPublished: boolean;
}

export const blogApi = {
  list() {
    return api.get<BlogPostDto[]>("/api/admin/blog");
  },

  getById(id: number) {
    return api.get<BlogPostDto>(`/api/admin/blog/${id}`);
  },

  create(body: BlogPostFormData) {
    return api.post<BlogPostDto>("/api/admin/blog", body);
  },

  update(id: number, body: BlogPostFormData) {
    return api.put<BlogPostDto>(`/api/admin/blog/${id}`, body);
  },

  delete(id: number) {
    return api.delete<{ message: string }>(`/api/admin/blog/${id}`);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/blog/upload-image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Görsel yüklenemedi.");
    }

    const data = await res.json();
    return data.url as string;
  },
};
