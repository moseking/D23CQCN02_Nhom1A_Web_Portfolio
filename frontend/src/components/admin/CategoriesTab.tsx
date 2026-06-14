"use client";

import { useEffect, useState } from "react";

import { Tag } from "lucide-react";

import { adminService } from "../../services/adminService";

import SearchBar from "./SearchBar";

import type { Category } from "../../types/admin";

import { Plus, Trash2 } from "lucide-react";
import CategoryModal from "./CategoryModal";

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const data = await adminService.getCategories();

      setCategories(data.categories || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (name: string, slug: string) => {
    await adminService.createCategory(name, slug);
    setShowModal(false);
    fetchCategories();
  };

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(
      `Xoá tag "${category.name}" khỏi hệ thống?`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteCategory(category.slug, category.name);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xoá tag.");
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-[#E5E7E1]
          bg-white
          p-6
          text-sm
          text-[#6B7280]
        "
      >
        Loading categories...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
          />
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-[#9CAF88] px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="mr-2 inline h-4 w-4" />
          Add tag
        </button>
      </div>

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {filtered.map((category) => (
          <div
            key={category._id}
            className="
              rounded-2xl
              border
              border-[#E5E7E1]
              bg-white
              p-5
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#F0F4EC]
                  "
                >
                  <Tag
                    className="
                      h-5
                      w-5
                      text-[#7C8C6B]
                    "
                  />
                </div>

                <div>
                  <h3
                    className="
                      font-semibold
                      text-[#2C2C2C]
                    "
                  >
                    {category.name}
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-[#9CA3AF]
                    "
                  >
                    /{category.slug}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteCategory(category)}
                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                title="Delete tag"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div
              className="
                mt-4
                rounded-xl
                bg-[#F6F7F2]
                px-3
                py-2
              "
            >
              <p
                className="
                  text-xs
                  text-[#6B7280]
                "
              >
                Posts
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-[#2C2C2C]
                "
              >
                {category.postsCount}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-[#E5E7E1]
            bg-white
            py-16
            text-center
          "
        >
          <p
            className="
              text-sm
              text-[#9CA3AF]
            "
          >
            No categories found.
          </p>
        </div>
      )}

      {showModal && (
        <CategoryModal
          onClose={() => setShowModal(false)}
          onSave={handleCreateCategory}
        />
      )}
    </div>
  );
}
