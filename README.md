# Photographer

Website giới thiệu nhiếp ảnh cá nhân của Phạm Tiến Dũng được viết lại trên kiến trúc full-stack hiện đại gồm backend ASP.NET và frontend React.

## Kiến trúc
- **Backend:** ASP.NET Core 9 Web API (folder `backend/Photographer.Api`) trả về toàn bộ nội dung trang và nhận form liên hệ.
- **Frontend:** React + Vite (folder `frontend`) hiển thị giao diện, đồng bộ với backend qua REST API và sử dụng AOS, react-photo-view, react-typed.
- **Admin:** Trang quản trị React (`/admin`) cho phép xem danh sách liên hệ và upload ảnh để tái sử dụng trong portfolio.
- **Assets:** Ảnh gốc nằm trong `frontend/public/assets/img` và được backend mô tả tại `Data/siteContent.json`.

## Chuẩn bị
1. Cài .NET 9 SDK và Node.js 18+.
2. Cài MySQL 8+ (hoặc dùng Docker) và tạo database, ví dụ:
	 ```sql
	 CREATE DATABASE photographer_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
	 ```
3. Sao chép repo này.

## Cấu hình database
- Chỉnh chuỗi kết nối trong `backend/Photographer.Api/appsettings.json` (section `ConnectionStrings:Default`).
- Trường hợp dùng Docker, có thể khởi chạy nhanh:
	```powershell
	docker run -d --name photographer-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -p 3306:3306 mysql:8
	```
- API tự động tạo bảng (`EnsureCreated`) khi khởi động lần đầu.

## Chạy backend
```powershell
cd backend/Photographer.Api
dotnet restore
dotnet run
```
Backend mặc định lắng nghe tại `http://localhost:5162`. Có thể thay đổi cổng hoặc whitelist CORS bằng cách chỉnh `appsettings.json` (section `Frontend:Origins`).

## Chạy frontend
```powershell
cd frontend
npm install
npm run dev
```
Biến môi trường API được đặt trong `frontend/.env` (`VITE_API_BASE_URL`). Cập nhật giá trị này nếu backend chạy ở cổng khác. Sau khi chạy, truy cập `http://localhost:5173/` cho trang chính hoặc `http://localhost:5173/admin` cho trang quản trị.

## Build sản phẩm
- Backend: `dotnet publish -c Release`
- Frontend: `npm run build` (đầu ra mặc định ở `frontend/dist`).

## Trang admin
- Đường dẫn: `http://localhost:5173/admin`.
- Chức năng:
	- Upload ảnh (multipart) lên API `/api/admin/uploads`. File sẽ được lưu vào `wwwroot/uploads` của backend và trả về URL công khai.
	- Hiển thị danh sách liên hệ theo thời gian thực từ API `/api/admin/contacts` (dữ liệu lưu trong MySQL bảng `contact_messages`).
- Nút "Làm mới" giúp đồng bộ lại danh sách liên hệ mà không cần tải lại trang.

## Tùy biến nội dung
Toàn bộ text, thống kê, portfolio và dịch vụ nằm trong file JSON: `backend/Photographer.Api/Data/siteContent.json`. Sửa file rồi khởi động lại backend để frontend nhận dữ liệu mới.
