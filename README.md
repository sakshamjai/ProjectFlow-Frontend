# WorkPilot — Project Management App
# Admin and Member Dummy Credentials Admin: admin@gmail.com password: admin123 Member: saksham@gmail.com password: 123456
A full-stack **Project Management** application with role-based access control. Admins can manage projects, tasks, and team members; members can view and update their assigned tasks.

> **Deployment Note:** The Frontend and Backend are deployed **independently** and communicate over HTTP via a REST API.

---

## 📁 Repository Structure

```
Project-Management/
├── Frontend/   ← React + Vite SPA (this folder)
└── Backend/    ← Node.js + Express REST API
```

---

## 🖥️ Frontend

### Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Redux Toolkit | 2 | Global state management |
| React Redux | 9 | React–Redux bindings |
| Axios | 1 | HTTP client |
| Tailwind CSS | 4 | Utility-first styling |

### Pages & Features

| Page | Route | Access |
|---|---|---|
| Login | `/` | Public |
| Dashboard | `/dashboard` | All authenticated users |
| Projects | `/projects` | All authenticated users |
| Project Details | `/projects/:id` | All authenticated users |
| Tasks | `/tasks` | All authenticated users |

**Role-Based Features:**
- **Admin:** Create / edit / delete projects, tasks, and team members
- **Member:** View assigned tasks, update task status

### Project Structure

```
Frontend/
├── public/
├── src/
│   ├── api/            # Axios instance & base config
│   ├── app/            # Redux store setup
│   ├── assets/         # Static assets
│   ├── components/     # Reusable UI components (Spinner, etc.)
│   ├── features/       # Redux slices & API calls (auth, projects, tasks, users)
│   ├── layouts/        # DashboardLayout (sidebar + topbar)
│   ├── pages/          # Route-level page components
│   ├── routes/         # Protected route wrappers
│   ├── utils/          # Helper utilities
│   ├── App.jsx         # Root component with router
│   ├── main.jsx        # App entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.js
└── package.json
```

### Environment Variables

Create a `.env` file inside the `Frontend/` directory:

```env
VITE_API_BASE_URL=https://projectflow-backend-production.up.railway.app//api
```

> In development this should point to `http://localhost:8080/api`.
> On production, replace it with your deployed backend URL.

### Local Development

```bash
# 1. Navigate to the Frontend folder
cd Frontend

# 2. Install dependencies
npm install

# 3. Create the .env file (see above)

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

The optimised static files will be output to `Frontend/dist/`. Deploy the contents of `dist/` to any static host (Vercel, Netlify, GitHub Pages, etc.).

### Deployment (Vercel — recommended)

1. Push the `Frontend/` folder to a Git repository (or set Vercel root directory to `Frontend/`).
2. Add the environment variable `VITE_API_BASE_URL` in the Vercel dashboard.
3. Vercel auto-detects Vite — no extra configuration needed.

---

## ⚙️ Backend

### Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 5 | Web framework |
| MongoDB + Mongoose | 9 | Database & ODM |
| JSON Web Tokens | 9 | Authentication |
| bcrypt | 6 | Password hashing |
| cookie-parser | 1 | Cookie handling |
| cors | 2 | Cross-origin requests |
| express-validator | 7 | Request validation |
| morgan | 1 | HTTP request logging |
| dotenv | 17 | Environment variable loading |
| nodemon | 3 | Dev auto-reload |

### Project Structure

```
Backend/
├── src/
│   ├── config/         # DB connection & app config
│   ├── controllers/    # Route handler logic
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   └── dashboard.controller.js
│   ├── middlewares/    # auth.middleware.js, role.middleware.js
│   ├── models/         # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   └── task.model.js
│   ├── routes/         # Express routers
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   └── dashboard.routes.js
│   ├── validators/     # express-validator rule sets
│   ├── utils/          # createAdmin.js & other helpers
│   └── app.js          # Express app configuration
└── server.js           # Entry point
```

### Environment Variables

Create a `.env` file inside the `Backend/` directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbName>
JWT_SECRET=your_strong_jwt_secret_here
PORT=5000
NODE_ENV=production
```

> ⚠️ **Never commit your real `.env` file.** Add it to `.gitignore`.

### API Endpoints

**Base URL:** `https://your-backend-url.com/api`

#### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | ❌ | Login with email & password |
| POST | `/logout-user` | ❌ | Clear auth cookie |
| GET | `/get-me` | ✅ | Get current logged-in user |

#### 👥 Users — `/api/users`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | ✅ | Admin | List all users |
| POST | `/create-user` | ✅ | Admin | Create a new member |

#### 📂 Projects — `/api/projects`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/create` | ✅ | Admin | Create a new project |
| GET | `/` | ✅ | All | Get all projects |
| GET | `/:id` | ✅ | All | Get project by ID |
| PUT | `/:id` | ✅ | Admin | Update a project |
| DELETE | `/:id` | ✅ | Admin | Delete a project |

#### ✅ Tasks — `/api/tasks`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/create` | ✅ | Admin | Create a new task |
| GET | `/` | ✅ | All | Get all tasks |
| GET | `/project/:projectId` | ✅ | All | Get tasks by project |
| PUT | `/:id` | ✅ | All | Update a task |
| DELETE | `/:id` | ✅ | Admin | Delete a task |

#### 📊 Dashboard — `/api/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get aggregated dashboard stats |

> ✅ = JWT cookie required &nbsp;|&nbsp; ❌ = Public

### Local Development

```bash
# 1. Navigate to the Backend folder
cd Backend

# 2. Install dependencies
npm install

# 3. Create the .env file (see above)

# 4. Start the dev server with nodemon
npm run dev
```

The server will start on `http://localhost:5000`.

### Creating the First Admin

A utility script is included to seed the first admin user:

```bash
npm run create-admin
```

> Edit `src/utils/createAdmin.js` to set the desired admin credentials before running.

### Production Start

```bash
node server.js
```

### Deployment (Render — recommended)

1. Push the `Backend/` folder to a Git repository (or set the root directory to `Backend/`).
2. Set **Build Command:** `npm install`
3. Set **Start Command:** `node server.js`
4. Add all environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV`) in the Render dashboard.
5. Update the CORS `origin` in `src/app.js` to your deployed frontend URL before deploying:
   ```js
   // src/app.js
   app.use(cors({
       origin: "https://your-frontend-url.vercel.app",
       methods: ["GET", "POST", "PUT", "DELETE"],
       credentials: true
   }));
   ```

---

## 🔗 Connecting Frontend to Backend After Deployment

1. Deploy the **Backend** first and copy the live URL (e.g., `https://workpilot-api.onrender.com`).
2. Set the **Frontend** environment variable:
   ```env
   VITE_API_BASE_URL=https://workpilot-api.onrender.com/api
   ```
3. Update the **Backend** CORS `origin` to the deployed frontend URL.
4. Deploy (or redeploy) the **Frontend**.

---

## 🔒 Authentication Flow

- On login, the backend sets a **HTTP-only cookie** containing the JWT.
- Every subsequent request from the frontend sends this cookie automatically (`credentials: true` via Axios).
- Protected routes on the frontend check Redux auth state; unauthenticated users are redirected to `/`.

---

## 👤 User Roles

| Role | Permissions |
|---|---|
| `admin` | Full CRUD on projects, tasks, and members |
| `member` | View projects & tasks, update task status |

---

## 📜 License

ISC
