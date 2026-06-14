import { api } from "../lib/axios";

export const adminService = {
  async getUsers() {
    const response = await api.get("/admin/users");

    return response.data;
  },

  async changeUserRole(userId: string, role: string) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });

    return response.data;
  },

  async toggleBanUser(userId: string) {
    const response = await api.patch(`/admin/users/${userId}/ban`);

    return response.data;
  },

  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);

    return response.data;
  },

  async getPosts() {
    const response = await api.get("/admin/posts");

    return response.data;
  },

  async togglePostVisibility(postId: string) {
    const response = await api.patch(`/admin/posts/${postId}/visibility`);

    return response.data;
  },

  async deletePost(postId: string) {
    const response = await api.delete(`/admin/posts/${postId}`);

    return response.data;
  },

  async getComments() {
    const response = await api.get("/admin/comments");

    return response.data;
  },

  async toggleCommentVisibility(commentId: string) {
    const response = await api.patch(`/admin/comments/${commentId}/visibility`);

    return response.data;
  },

  async deleteComment(commentId: string) {
    const response = await api.delete(`/admin/comments/${commentId}`);

    return response.data;
  },

  async getCategories() {
    const response = await api.get("/admin/categories");

    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get("/admin/stats");

    return response.data;
  },

  async createCategory(name: string, slug?: string) {
    const response = await api.post("/admin/categories", {
      name,
      slug,
    });

    return response.data;
  },

  async deleteCategory(slug: string, name: string) {
    const response = await api.delete(`/admin/categories/${slug}`, {
      data: {
        name,
      },
    });

    return response.data;
  },
};
