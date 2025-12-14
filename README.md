# Sweet Shop Management System

A full-stack web application for managing a sweet shop with separate portals for customers and shop owners. Built with React, TypeScript, Express, and Prisma.

## Features

### Customer Portal
- Browse available sweets with images and pricing
- Add items to shopping cart with quantity controls
- Real-time stock availability checking
- Secure checkout and purchase process
- Responsive design for all devices

### Admin Portal
- Inventory management dashboard
- Add new sweets with image uploads
- Restock existing items
- View current stock levels with low-stock warnings
- Real-time inventory updates

### Authentication
- Dual registration system (Customer/Shop Owner)
- JWT-based authentication
- Secure password hashing with bcrypt
- Persistent sessions with localStorage
- Role-based access control

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Vite

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL/MySQL
- JWT for authentication
- Multer for file uploads
- Cloudinary for image storage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL or MySQL database
- Cloudinary account (for image uploads)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/sweet-shop.git
cd sweet-shop
```

### 2. Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Configuration

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sweetshop"
JWT_SECRET="your-secret-key-here"
PORT=3000

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

### Authentication

#### User Registration
```
POST /api/auth/register
Body: { email, password, role: "User" }
```

#### User Login
```
POST /api/auth/login
Body: { email, password }
```

#### Shop Registration
```
POST /api/shop/register
Body: { email, password, name, role: "Admin" }
```

#### Shop Login
```
POST /api/shop/login
Body: { email, password }
```

### Sweets Management

#### Get All Sweets
```
GET /api/sweet/bulk
Headers: Authorization: Bearer <token>
```

#### Add Sweet
```
POST /api/sweet/add
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: { name, category, price, quantity, image }
```

#### Search Sweets
```
GET /api/sweet/search?name=<name>&category=<category>&minPrice=<min>&maxPrice=<max>
```

#### Restock Sweet
```
POST /api/sweet/:id/restock
Headers: Authorization: Bearer <token>
Body: { quantity }
```

#### Purchase Sweet
```
POST /api/sweet/:id/purchase
Headers: Authorization: Bearer <token>
Body: { quantity }
```

#### Update Sweet
```
PUT /api/sweet/update/:id
Headers: Authorization: Bearer <token>
Body: { name?, category?, price?, quantity?, image? }
```

#### Delete Sweet
```
DELETE /api/sweet/delete/:id
Headers: Authorization: Bearer <token>
```

## Database Schema

### User Table
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      String
  createdAt DateTime @default(now())
}
```

### Shop Table
```prisma
model Shop {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String
  sweets    Sweet[]
  createdAt DateTime @default(now())
}
```

### Sweet Table
```prisma
model Sweet {
  id        Int      @id @default(autoincrement())
  shopId    Int
  name      String
  category  String
  price     Float
  quantity  Int
  image     String
  shop      Shop     @relation(fields: [shopId], references: [id])
  createdAt DateTime @default(now())
}
```

## Project Structure

```
sweet-shop/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── shop.ts
│   │   │   └── sweet.ts
│   │   ├── middleware.ts
│   │   ├── types.ts
│   │   ├── db.ts
│   │   ├── multer.ts
│   │   ├── cloudinary.config.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── BuySweets.tsx
│   │   │   └── RestockSweets.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env
│
└── README.md
```

## Authentication Flow

1. User selects role (Customer/Shop Owner) during registration
2. Backend validates credentials and creates account
3. JWT token is generated and returned
4. Frontend stores token and role in localStorage
5. Token is included in Authorization header for protected routes
6. Backend middleware verifies token and extracts user/shop ID

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Protected API routes with middleware
- Role-based access control
- Input validation using Zod schemas
- SQL injection prevention via Prisma ORM

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@sweetshop.com or open an issue in the GitHub repository.

## Acknowledgments

- React team for the amazing framework
- Prisma for the excellent ORM
- Tailwind CSS for the utility-first styling approach
- Cloudinary for image hosting services
