# 🌦️ IoT-Based Weather Station Dashboard

## 🧭 Overview
The **IoT-Based Weather Station Dashboard** is a modern web application built using **Vue.js** and **Chart.js** to simulate and visualize real-time weather data.  
It demonstrates how IoT dashboards can represent live environmental parameters through interactive charts and a clean user interface.

## 🚀 Key Features
- 🔐 **User Authentication** — Login, Signup, and Forgot Password pages  
- 📊 **Dynamic Dashboard** — Displays simulated data for parameters like temperature, humidity, and air quality  
- 💻 **Modern UI** — Built with Vue.js and Tailwind CSS for a smooth, responsive design  
- ⚙️ **Chart Animations** — Real-time simulation using Chart.js  

## 🖥️ Tech Stack
| Layer | Technology Used |
|-------|------------------|
| **Frontend Framework** | Vue.js 3 |
| **Charting Library** | Chart.js |
| **Styling** | Tailwind CSS |
| **Routing** | Vue Router |
| **Hosting** | Vercel / Netlify |

## 🧩 Project Structure
```bash
├── src/
│   ├── components/
│   │   ├── LoginPage.vue
│   │   ├── SignupPage.vue
│   │   ├── ForgotPassword.vue
│   │   └── DashboardPage.vue
│   ├── assets/
│   ├── App.vue
│   └── main.js
├── public/
│   └── index.html
├── package.json
└── README.md
````

## 🖼️ Screenshots

### 🔑 Login Page

![Login Page](https://github.com/user-attachments/assets/af2e5968-8ebe-48f8-823a-45b192e1a5ca)

### 📈 Dashboard

![Dashboard](https://github.com/user-attachments/assets/fed61d82-71b9-4feb-8eaf-43860f6fc28c)

---

## ⚙️ Setup Instructions

Follow these steps to run the dashboard locally:

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Then open your browser and go to:

```
http://localhost:5173/
```
