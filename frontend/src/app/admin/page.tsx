"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";

import { adminService,} from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";
import CategoriesTab from "../../components/admin/CategoriesTab";
import CommentsTab from "../../components/admin/CommentsTab";
import PostsTab from "../../components/admin/PostsTab";
import UsersTab from "../../components/admin/UsersTab";

type Tab =
  | "users"
  | "posts"
  | "comments"
  | "categories";

export default function AdminPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [tab, setTab] =
    useState<Tab>("users");
  const [stats, setStats] =
    useState({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
    });
    useEffect(() => {
  fetchStats();
}, []);
const fetchStats = async () => {
  try {
    setLoading(true);

    const data =
      await adminService.getDashboardStats();

    setStats({
      totalUsers:
        data.totalUsers || 0,

      totalPosts:
        data.totalPosts || 0,

      totalComments:
        data.totalComments || 0,
    });
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};
const [loading, setLoading] =
  useState(true);
  const handleLogout = () => {
    logout();
    router.push("/auth?mode=login");
  };

  const menus = [
    {
      id: "users",
      label: "Users",
      icon: Users,
    },

    {
      id: "posts",
      label: "Posts",
      icon: LayoutDashboard,
    },

    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
    },

    {
      id: "categories",
      label: "Categories",
      icon: FolderKanban,
    },
  ];

  return (
    <div
      className="
        flex
        min-h-screen
        bg-[#F6F7F2]
      "
    >
      {/* SIDEBAR */}

      <aside
        className="
          hidden
          w-[260px]
          border-r
          border-[#E5E7E1]
          bg-white
          lg:flex
          lg:flex-col
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-[#E5E7E1]
            px-6
            py-6
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#9CAF88]
              text-white
            "
          >
            <Shield className="h-6 w-6" />
          </div>

          <div>
            <h2
              className="
                text-lg
                font-semibold
                text-[#2C2C2C]
              "
            >
              Admin Panel
            </h2>

            <p
              className="
                text-sm
                text-[#9CA3AF]
              "
            >
              Super Admin
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;

              const active =
                tab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setTab(
                      item.id as Tab
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition-all

                    ${
                      active
                        ? `
                          border
                          border-[#2C2C2C]
                          bg-[#F6F7F2]
                          text-[#7C8C6B]
                        `
                        : `
                          text-[#6B7280]
                          hover:bg-[#F6F7F2]
                        `
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />

                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* CONTENT */}

      <main className="flex-1">
        {/* HEADER */}

        <header
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#E5E7E1]
            bg-white
            px-6
            py-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <button
              className="
                rounded-lg
                p-2
                hover:bg-[#F6F7F2]
              "
            >
              <Menu
                className="
                  h-5
                  w-5
                  text-[#6B7280]
                "
              />
            </button>

            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  text-[#2C2C2C]
                "
              >
                Users Management
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-[#9CA3AF]
                "
              >
                Quản lý nội dung &
                người dùng
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-5
            "
          >
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-[#E5E7E1]
                px-4
                py-2
                text-sm
                font-semibold
                text-[#6B7280]
                transition
                hover:border-[#E57373]
                hover:bg-[#FFF1F1]
                hover:text-[#D64545]
              "
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <button
              type="button"
              className="
                relative
                rounded-lg
                p-2
                hover:bg-[#F6F7F2]
              "
            >
              <Bell
                className="
                  h-5
                  w-5
                  text-[#6B7280]
                "
              />

              <span
                className="
                  absolute
                  right-2
                  top-2
                  h-2
                  w-2
                  rounded-full
                  bg-[#E57373]
                "
              />
            </button>

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
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-[#9CAF88]
                  text-lg
                  font-semibold
                  text-white
                "
              >
                AD
              </div>

              <div>
                <p
                  className="
                    font-medium
                    text-[#2C2C2C]
                  "
                >
                  Admin
                </p>

                <p
                  className="
                    text-sm
                    text-[#9CA3AF]
                  "
                >
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* BODY */}

        <div className="p-6">
          {/* STATS */}

          <div
            className="
              mb-6
              grid
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            <div
              className="
                rounded-3xl
                border
                border-[#E5E7E1]
                bg-white
                p-6
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#F0F4EC]
                  "
                >
                  <Users
                    className="
                      h-6
                      w-6
                      text-[#7C8C6B]
                    "
                  />
                </div>

                <h3
                  className="
                    text-4xl
                    font-bold
                    text-[#2C2C2C]
                  "
                >
                  {
                    loading
                        ? "..."
                        : stats.totalUsers
                    }
                </h3>
              </div>

              <p
                className="
                  mt-5
                  text-sm
                  text-[#6B7280]
                "
              >
                Tổng Users
              </p>
            </div>

            <div
              className="
                rounded-3xl
                border
                border-[#E5E7E1]
                bg-white
                p-6
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#FFF3D6]
                  "
                >
                  <LayoutDashboard
                    className="
                      h-6
                      w-6
                      text-[#C68B00]
                    "
                  />
                </div>

                <h3
                  className="
                    text-4xl
                    font-bold
                    text-[#2C2C2C]
                  "
                >
                  {
                    loading
                        ? "..."
                        : stats.totalPosts
                    }
                </h3>
              </div>

              <p
                className="
                  mt-5
                  text-sm
                  text-[#6B7280]
                "
              >
                Tổng Posts
              </p>
            </div>

            <div
              className="
                rounded-3xl
                border
                border-[#E5E7E1]
                bg-white
                p-6
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#EEF2FF]
                  "
                >
                  <MessageSquare
                    className="
                      h-6
                      w-6
                      text-[#6366F1]
                    "
                  />
                </div>

                <h3
                  className="
                    text-4xl
                    font-bold
                    text-[#2C2C2C]
                  "
                >
                  {
                    loading
                        ? "..."
                        : stats.totalComments
                    }
                </h3>
              </div>

              <p
                className="
                  mt-5
                  text-sm
                  text-[#6B7280]
                "
              >
                Comments
              </p>
            </div>

          </div>

          {/* TAB CONTENT */}

          {tab === "users" && (
            <UsersTab />
          )}

          {tab === "posts" && (
            <PostsTab />
          )}

          {tab === "comments" && (
            <CommentsTab />
          )}

          {tab === "categories" && (
            <CategoriesTab />
          )}
        </div>
      </main>
    </div>
  );
}
