# Swasthyalink - Digital Healthcare Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com/)

Swasthyalink is a comprehensive digital healthcare platform that enables patients, doctors, and family members to manage health records, appointments, and medical information securely and efficiently.

## 🚀 Features

### For Patients
- **Digital Health Records**: Secure storage and management of medical records
- **QR Code Access**: Quick access to patient information via QR codes
- **Family Management**: Control family member access to health records
- **Appointment Scheduling**: Book and manage medical appointments
- **Emergency Access**: Emergency contacts can access critical information
- **Notification System**: Real-time updates on record access and changes

### For Doctors
- **Patient Management**: Access and update patient records
- **Appointment Management**: Schedule and manage patient appointments
- **Medical Records**: Add diagnoses, prescriptions, and treatment notes
- **Secure Communication**: Communicate with patients and family members

### For Family Members
- **Controlled Access**: View patient records based on assigned permissions
- **Emergency Features**: Access critical information during emergencies
- **Notification Updates**: Receive updates about patient health changes
- **Secure Dashboard**: Dedicated interface for family member interactions

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0 with Vite
- **Styling**: Tailwind CSS with custom components
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Routing**: React Router DOM
- **QR Codes**: react-qr-code
- **Icons**: Material Icons
- **Linting**: ESLint with React hooks plugin

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Firebase account** for backend services

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Swasthyalink/frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Copy your Firebase configuration
4. Update `src/firebaseConfig.js` with your Firebase credentials

```javascript
// src/firebaseConfig.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, and other assets
│   ├── components/        # Reusable React components
│   │   ├── Chatbot.jsx
│   │   ├── CursorTrail.jsx
│   │   ├── Loader.jsx
│   │   ├── NotificationCenter.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── Sidebar.jsx
│   │   ├── footer.jsx
│   │   └── header.jsx
│   ├── pages/             # Page components
│   │   ├── about.jsx
│   │   ├── doctordashboard.jsx
│   │   ├── familydashboard.jsx
│   │   ├── home.jsx
│   │   ├── login.jsx
│   │   ├── patientdashboard.jsx
│   │   ├── register.jsx
│   │   ├── settings.jsx
│   │   └── SnakeGame.jsx
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   ├── index.css          # Global styles
│   └── firebaseConfig.js  # Firebase configuration
├── eslint.config.js       # ESLint configuration
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite configuration
└── package.json           # Project dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Security Features

- **Firebase Authentication**: Secure user authentication and authorization
- **Private Routes**: Protected routes requiring authentication
- **Access Control**: Granular permissions for family member access
- **Data Encryption**: Secure data transmission and storage
- **Audit Trails**: Logging of access and modifications

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Smooth animations and transitions
- **Accessibility**: WCAG compliant design patterns
- **Dark/Light Theme**: Support for theme preferences
- **Loading States**: Elegant loading animations and states

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface for smartphones

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Deploy
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@swasthyalink.com
- **Documentation**: [Family Module Documentation](./FAMILY_MODULE_README.md)
- **Issues**: Create an issue on GitHub

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for backend services
- Tailwind CSS for the utility-first CSS framework
- All contributors who have helped improve this project
