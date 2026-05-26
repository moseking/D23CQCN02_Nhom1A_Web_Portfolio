"use client";

import { useEffect, useState } from "react";

import {
  Lock,
  Trash2,
  Unlock,
} from "lucide-react";

import { adminService } from "../../services/adminService";

import ActionButton from "./ActionButton";
import Avatar from "./Avatar";
import Badge from "./Badge";
import ConfirmModal from "./ConfirmModal";
import SearchBar from "./SearchBar";

import type {
  User,
  Role,
} from "../../types/admin";

export default function UsersTab() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [confirm, setConfirm] =
    useState<{
      msg: string;
      action: () => void;
    } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data =
        await adminService.getUsers();

      setUsers(data.users || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (
    id: string,
    role: Role
  ) => {
    try {
      await adminService.changeUserRole(
        id,
        role
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const toggleBan = async (
    id: string
  ) => {
    try {
      await adminService.toggleBanUser(
        id
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (
    id: string
  ) => {
    try {
      await adminService.deleteUser(
        id
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const filtered =
    users.filter(
      (u) =>
        u.username
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        u.email
          .toLowerCase()
          .includes(search.toLowerCase())
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
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {confirm && (
        <ConfirmModal
          message={confirm.msg}
          onConfirm={() => {
            confirm.action();

            setConfirm(null);
          }}
          onCancel={() =>
            setConfirm(null)
          }
        />
      )}

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
            placeholder="Search users..."
          />
        </div>

        <div
          className="
            rounded-xl
            border
            border-[#E5E7E1]
            bg-[#F6F7F2]
            px-3
            py-2
            text-xs
            text-[#6B7280]
          "
        >
          {filtered.length} users
        </div>
      </div>

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-[#E5E7E1]
          bg-white
        "
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="
                border-b
                border-[#E5E7E1]
                bg-[#F6F7F2]
              "
            >
              <th className="px-5 py-3 text-left">
                User
              </th>

              <th className="px-4 py-3 text-left">
                Role
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

              <th className="px-4 py-3 text-left">
                Posts
              </th>

              <th className="px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody
            className="
              divide-y
              divide-[#F3F4F6]
            "
          >
            {filtered.map((user) => (
              <tr
                key={user._id}
                className="
                  hover:bg-[#FAFAF8]
                "
              >
                <td className="px-5 py-4">
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <Avatar
                      initials={user.username
                        .charAt(0)
                        .toUpperCase()}
                    />

                    <div>
                      <p
                        className="
                          font-medium
                          text-[#2C2C2C]
                        "
                      >
                        {user.username}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          text-[#9CA3AF]
                        "
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      changeRole(
                        user._id,
                        e.target
                          .value as Role
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-[#E5E7E1]
                      bg-white
                      px-2
                      py-1.5
                      text-xs
                      focus:border-[#9CAF88]
                      focus:outline-none
                    "
                  >
                    <option value="user">
                      User
                    </option>

                    <option value="moderator">
                      Moderator
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </td>

                <td className="px-4 py-4">
                  <Badge
                    variant={
                      user.status ===
                      "active"
                        ? "success"
                        : "danger"
                    }
                  >
                    {user.status}
                  </Badge>
                </td>

                <td className="px-4 py-4">
                  <p
                    className="
                      text-sm
                      text-[#4B5563]
                    "
                  >
                    {user.postsCount}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div
                    className="
                      flex
                      items-center
                      justify-end
                      gap-1
                    "
                  >
                    <ActionButton
                      icon={
                        user.status ===
                        "active"
                          ? Lock
                          : Unlock
                      }
                      label={
                        user.status ===
                        "active"
                          ? "Ban user"
                          : "Unban user"
                      }
                      onClick={() =>
                        toggleBan(
                          user._id
                        )
                      }
                    />

                    <ActionButton
                      icon={Trash2}
                      label="Delete user"
                      variant="danger"
                      onClick={() =>
                        setConfirm({
                          msg: `Delete ${user.username}?`,
                          action: () =>
                            deleteUser(
                              user._id
                            ),
                        })
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div
            className="
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
              No users found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
