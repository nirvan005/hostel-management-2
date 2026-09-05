# Hostel Harmony Hub

I am building a multi-tenant university hostel management system called HostelOS. Below is the Context State Document summarizing the exact design system, components, mock data structure, and routes built in Modules 1, 2, and 3. Please adopt this exact style and execute Module 4 (Admin Management Views) to complete the frontend.

### Context State Document (Modules 1, 2 & 3 Output)

- **Tech Stack:** TanStack Start v1 (React 19, Vite 7), Tailwind CSS v4 (`src/styles.css`), shadcn/ui (Radix primitives), `lucide-react`, `recharts`, `sonner` toasts.

- **Design System:** Deep teal (`oklch(0.52 0.098 202)`) + warm amber (`oklch(0.79 0.14 75)`), enterprise SaaS aesthetic, glassmorphic panels (`glass-panel`), display font `Outfit`, sans `Plus Jakarta Sans`.

- **Existing Routes:**

  - `/` -> Login screen (Split-screen layout with email/password and role toggle).

  - `/register` -> Student registration page.

  - `/student/*` -> Student Portal (tabs for `/student/room`, `/student/requests`, `/student/leaves`, `/student/financials`).

  - `/admin` -> Admin Dashboard (KPI cards, Occupancy Ring chart, Revenue Bar chart, Action Queue).

- **Shared Components:** `StatusBadge`, `KpiCard`, `OccupancyRing`, `RevenueChart`, `ActionQueue`, `Toaster`.

### Instructions for Current Task (Module 4: Admin Management Views)

Please build the entire application shell including the previously built routes (`/`, `/register`, `/student/*`, `/admin`) and add the final admin management pages under `/admin/*`:

1. **Students List (`/admin/students`):** Data table with search, status filter, and pagination. Clicking a row opens a slide-out Sheet displaying full student profile (room, phone, emergency contact, active leave status).

2. **Leaves Management (`/admin/leaves`):** Table/Queue of leave requests with inline "Approve" / "Reject" buttons, and action buttons for "Mark Exited" / "Mark Returned" with sonner toast notifications.

3. **Invoices Ledger (`/admin/invoices`):** Ledger table showing Invoice ID, Student Name, Room, Amount, Due Date, and Status (`Paid | Unpaid | Overdue`) with a "Generate Invoice" trigger button.

4. **Rooms Grid (`/admin/rooms`):** Visual floor-by-floor grid of room cards. Color-coded (Green = Vacant, Red = Occupied, Yellow = Maintenance). Clicking a room opens a detail modal showing occupants and capacity.

Create realistic mock data in `src/lib/mock-data.ts` to power all views.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/99952eba-4566-41dc-9597-92cf19d462ef).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
