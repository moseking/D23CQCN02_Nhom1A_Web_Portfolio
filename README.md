# 🎨 D23CQCN02_Nhom1A_Web_Portfolio

## 📌 Giới thiệu

Đồ án cuối kỳ môn **INT1334 – Lập trình Web** tại PTIT.

### 🖼️ Đề tài

# Creative Portfolio Platform

Nền tảng chia sẻ tác phẩm sáng tạo cho phép người dùng:

- Xây dựng portfolio cá nhân
- Đăng tải ảnh/video
- Tương tác cộng đồng thông qua:
  - ❤️ Like
  - 💬 Comment
  - 👥 Follow
  - 🔔 Notification realtime

---

# 🚀 Chức năng chính

## 🔐 Authentication

- Đăng ký tài khoản
- Đăng nhập
- Đăng xuất
- JWT Authentication
- Refresh Token
- Phân quyền User / Admin

---

## 👤 User Management

- Xem hồ sơ cá nhân
- Chỉnh sửa hồ sơ
- Upload avatar
- Follow / Unfollow người dùng
- Portfolio cá nhân

---

## 📝 Post Management

- Tạo bài viết
- Chỉnh sửa bài viết
- Xóa bài viết
- Feed bài viết
- Explore bài viết
- Upload ảnh/video

---

## ❤️ Interaction

- Like bài viết
- Comment bài viết
- Save bài viết
- Notification realtime

---

## 🔍 Search System

- Tìm kiếm theo tag
- Tìm kiếm người dùng
- Filter bài viết

---

# 🛠️ Công nghệ sử dụng

## Frontend

- NextJS 15 (App Router)
- Tailwind CSS
- React Hook Form
- Zod
- Zustand / Context API

---

## Backend

- NodeJS
- ExpressJS
- JWT Authentication
- Socket.io

---

## Database

- MongoDB Atlas
- Mongoose

---

## Cloud & Media

- Cloudinary

---

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# 📂 Cấu trúc thư mục

```txt
D23CQCN02_Nhom1A_Web_Portfolio/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   ├── create-post/
│   │   ├── explore/
│   │   ├── notifications/
│   │   └── post/
│   │       └── [id]/
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── post/
│   │   ├── comment/
│   │   ├── notification/
│   │   └── common/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── store/
│   ├── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚙️ Cài đặt project

Clone repository:

```bash
git clone https://github.com/moseking/D23CQCN02_Nhom1A_Web_Portfolio.git
```

Di chuyển vào project:

```bash
cd D23CQCN02_Nhom1A_Web_Portfolio
```

## 📦 Cài đặt Frontend

```bash
cd frontend
npm install
```

## 📦 Cài đặt Backend

```bash
cd ../backend
npm install
```

---

## 🔑 Cấu hình môi trường

Frontend
Tạo file:

```txt
frontend/.env.local
```

Thêm:

```env
NEXT_PUBLIC_API_URL=
```

Backend
Tạo file:

```txt
backend/.env
```

Thêm:

```env
MONGODB_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

## ▶️ Chạy project

Chạy Frontend

```bash
cd frontend
npm run dev
```

Frontend chạy tại: http://localhost:3000

Chạy Frontend

```bash
cd backend
npm run dev
```

---

## 🌱 Git Workflow

Tạo branch:

```bash
git checkout -b feature/ten-task
```

Ví dụ:

```bash
git checkout -b feature/post
```

Commit:

```bash
git add .

git commit -m "feat: add post schema"
```

Push:

```bash
git push origin feature/post
```

Không push trực tiếp lên:

```txt
main
```

Luồng làm việc:

```txt
feature/*
↓
dev
↓
main
```

---

## 👥 Thành viên nhóm

| MSSV       | Họ tên              | Vai trò               |
| ---------- | ------------------- | --------------------- |
| N23DCCN112 | Nguyễn Thị Yến Nhi  | Authentication & User |
| N23DCCN118 | Hứa Như Quỳnh       | Post & Feed           |
| N23DCCN096 | Lương Thị Như Huỳnh | Deploy & Advanced     |

---

## 📋 Tiến độ dự án

### Sprint 1

- [ ] Setup project
- [ ] MongoDB
- [ ] Authentication
- [ ] CRUD Post
- [ ] Feed UI

### Sprint 2

- [ ] Like
- [ ] Comment
- [ ] Follow
- [ ] Upload ảnh/video
- [ ] Deploy

---

## 📄 License

Dự án phục vụ mục đích học tập tại PTIT.
