# Real-Time Notes Frontend

A Next.js (TypeScript) client for collaborative candidate notes with JWT auth, ShadCN UI, real-time chat, `@username` tagging, toast/notifications, and document uploads.

## 🔗 Live Deployment (Frontend):
https://algohire-notes-frontend.vercel.app/login

## 🔑 Features

- **Authentication**: Login/Signup with JWT  
- **Dashboard**: Candidate list + “Add Candidate” modal  
- **Notes Page**: Real-time chat via Socket.io  
- **@username Tagging**: Autocomplete mentions (react-mentions)  
- **Notifications**  
  - Real-time toast on mention  
  - Dashboard “Your Mentions” card  
- **Document Upload**: Attach & share documents in notes  
- **Responsive** UI via ShadCN + Tailwind

## 🚀 Quickstart

### 1. Prerequisites

- Node.js v18+ & Yarn  
- A running backend at `BACKEND_URL`  
- (Optional) Git & GitHub account

### 2. Clone & Install

```bash
git clone https://github.com/<your-org>/realtime-notes-frontend.git
cd realtime-notes-frontend
yarn install
