# Task Tracker

A robust, feature-rich Todo application featuring a Node.js/Express backend and a Vanilla JavaScript frontend. This project manages tasks with persistent storage, real-time analytics, and advanced filtering capabilities.

## Features

- **Task Management**: Create, delete, and toggle completion status of tasks.

- **Prioritization**: Assign priority levels (High, Medium, Low) to tasks.

- **Smart Persistence**:
  - **Local Storage**: Persists tasks across browser sessions.
  - **Session Storage**: Drafts input text is saved automatically while typing.

- **Analytics Dashboard**: Real-time visualization of task completion and priority distribution using Chart.js.

- **Advanced Filtering**: Filter by status (Active, Completed) or Priority (High).

- **Pagination**: Handles large lists of tasks efficiently.

- **Data Export**: Export your tasks to a JSON file.

- **Unique IDs**: Generates KSUIDs via the backend (with UUID fallback).

## 🛠️ Tech Stack

**Backend**
- Runtime: Node.js (>=18.0.0)
- Framework: Express.js
- Utilities: KSUID (for unique ID generation)
- Dev Tools: Nodemon

**Frontend**
- Language: Vanilla JavaScript (ES Modules)
- Styling: CSS3
- Libraries: Chart.js (Data Visualization)

## System Design (UML Diagram)
![UML Diagram](./docs/system%20design%20UML.svg)

## Getting Started

### Prerequisites

- Node.js (Version 18 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AhmedEssamYassin/Task-Tracker.git
cd Task-Tracker
```

2. **Install Dependencies:**

You need to install dependencies for the root, the client, and the server.
```bash
# Install root dependencies
npm install

# Install Client dependencies
cd client
npm install

# Install Server dependencies
cd ../server
npm install
```

### Running the Application

To run both the frontend (Vite) and backend (Express) simultaneously, run the following command from the root directory:
```bash
npm run dev
```

- **Frontend**: Accessible at `http://localhost:5173` (or the port assigned by Vite)
- **Backend**: Running at `http://localhost:3000`

## 🔌 API Endpoints

The Express server provides utility endpoints for the frontend:

| Method | Endpoint      | Description                                    |
|--------|---------------|------------------------------------------------|
| GET    | `/api/ksuid`  | Returns a unique KSUID for new task creation. |

## 📝 License

Distributed under the MIT License. See the LICENSE file for details.