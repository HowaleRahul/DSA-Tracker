# DSA Revision Tracker

A modern, responsive, full-stack web application designed for students and professionals to track their Data Structures and Algorithms (DSA) preparation for coding interviews.

## Features

- **Full-Stack:** Built with React, Tailwind CSS (v4), Node.js, Express, and MongoDB.
- **Smart Revision Logic:** Automatically calculates the next revision date based on your confidence level (1-5).
- **GitHub-Style Contribution Calendar:** Visualize your daily activity and streaks directly on your dashboard.
- **Rich Markdown Support:** Write your approach and mistake notes using Markdown, with full code block support.
- **Interactive Dashboard:** View charts summarizing your difficulty distribution and top weak topics.
- **Export/Import:** Easily backup your data to a JSON file and restore it on any device.
- **Dark Mode:** Seamlessly toggle between light and dark themes.

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/dsa-tracker` or update `.env` in the backend folder)

## Getting Started

You can run the entire application (both frontend and backend) with a single command from the root directory.

### 1. Install Dependencies
Navigate to the root directory and run the helper script to install dependencies for the root, frontend, and backend simultaneously:

```bash
npm run install-all
```

### 2. Start the Application
From the root directory, run:

```bash
npm start
```

This uses `concurrently` to boot up both servers:
- **Frontend** will be available at `http://localhost:5173`
- **Backend API** will run on `http://localhost:5000`

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts, React-Activity-Calendar, React-Markdown.
- **Backend:** Node.js, Express, Mongoose.
- **Database:** MongoDB.

## License
MIT
