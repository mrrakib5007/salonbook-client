# SalonBook - Client Frontend

A modern, role-based salon appointment booking and management platform frontend built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **DaisyUI 5**. SalonBook provides a seamless booking experience for customers and a full-featured administrative workspace for salon managers.

---

## Project Links

- **Live Website:** [https://salonbookpro.vercel.app](https://salonbookpro.vercel.app)
- **Live API Endpoint:** [https://api-salonbookpro.vercel.app](https://api-salonbookpro.vercel.app)
- **Client Repository:** [https://github.com/mrrakib5007/salonbook-client](https://github.com/mrrakib5007/salonbook-client)
- **Server Repository:** [https://github.com/mrrakib5007/salonbook-server](https://github.com/mrrakib5007/salonbook-server)

---

## Important Features

### Customer Experience
- **Interactive Homepage:** Hero showcase, service categories, featured offerings, customer reviews, and step-by-step booking workflow.
- **Service Catalog & Filtering:** Search by service title or category, sort by price (low/high) or duration, and view real-time pricing and duration.
- **Dynamic Service Details & Scheduling:** Detailed service insights, description, category badges, real-time date and time slot availability checks (preventing double bookings), and booking request form.
- **Stripe Sandbox Checkout:** One-click redirection to Stripe Checkout for confirmed appointments with Dynamic Payment Methods, verified checkout sessions, and dedicated success/cancel pages.
- **Customer Dashboard:**
  - Real-time stat cards (Total, Pending, Confirmed, and Cancelled appointments).
  - Appointment management: Filter by status, cancel pending requests, and initiate Stripe payments.
  - Profile management: Edit full name, upload custom profile photo via ImgBB or external image URL, and update contact phone number.

### Administrative Portal
- **Role-Protected Workspace:** Secured with server-side role validation and Next.js proxy route guards (`/admin-dashboard/*`).
- **Overview Metrics:** Salon metrics covering total registered customers, active services, appointments, and successful revenue.
- **Service Management (CRUD):** Add new salon services, edit existing listings, toggle service active/inactive status, and delete services.
- **Appointment Management:** Filter salon bookings by status or payment, confirm pending bookings, cancel appointments, and review customer notes.
- **Customer Directory:** View customer accounts, booking history, and manage access with instant Block/Unblock actions.
- **Immutable Transaction Records:** Dedicated audit trail of verified Stripe payments displaying customer information, service details, appointment schedule, transaction dates, and Stripe session references.
- **Administrator Profile:** Full profile customization (name, photo upload, contact info) with automatic session synchronization.

### Design and Usability
- **Modern Typography:** Poppins body typography paired with Fraunces serif headings.
- **Tailwind CSS v4 & DaisyUI 5:** Clean, responsive design optimized for mobile, tablet, and desktop screens with canonical spacing scales.
- **Global Error & 404 Handling:** Custom 404 Not Found page, 403 Unauthorized screen, and account restriction alerts.

---

## Technology Stack

- **Next.js:** React Framework (App Router, Turbopack, Partial Prerendering / SSR)
- **TypeScript:** Strict Type Safety
- **Tailwind CSS v4:** Modern Utility-First CSS Framework
- **DaisyUI:** Tailwind CSS Component Library
- **Better-Auth 1.7:** Authentication Framework (Google OAuth & Email/Password)
- **React Icons (`react-icons/lu`):** Feather & Lucide Icon Suite
- **React Hot Toast:** Toast Notifications

---

## Installation Instructions

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/mrrakib5007/salonbook-client.git
cd salonbook-client
```

### 2. Install Dependencies
```bash
npm install
```

---

## Required Environment Variables

Create a `.env.local` or `.env` file in the root of the `client` directory.

| Variable Name | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Secret key used by Better-Auth for signing session cookies |
| `BETTER_AUTH_URL` | Base URL of the client application (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Client-accessible Better-Auth URL |
| `NEXT_PUBLIC_SERVER_URL` | Backend Express server API URL (e.g. `http://localhost:5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string for Better-Auth Mongo adapter |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Web Client Secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key for client-side checkout |

---

## How to Run Locally

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Linter
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

---

## Project Architecture

```text
client/
├── public/                 # Static assets, hero banners, category thumbnails
├── src/
│   ├── app/
│   │   ├── (auth)/         # Authentication routes (sign-in, sign-up)
│   │   ├── admin-dashboard/# Administrator portal (services, appointments, users, tx, profile)
│   │   ├── dashboard/      # Customer portal (appointments, profile, payment states)
│   │   ├── services/       # Public service catalog and dynamic details page
│   │   ├── payment-success/# Standalone post-payment verification page
│   │   ├── payment-cancel/ # Standalone payment cancellation recovery page
│   │   ├── not-found.tsx   # Global 404 page
│   │   ├── layout.tsx      # Root HTML layout with font configuration
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable UI cards, sections, modals, and navigation
│   ├── lib/                # Better-Auth server and React client instances
│   └── proxy.ts            # Route protection middleware
├── next.config.ts          # Next.js compiler and remote image configuration
└── tsconfig.json           # TypeScript configuration
```

---

## License

This project is licensed under the [MIT License](LICENSE).
