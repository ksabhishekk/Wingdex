# Wingdex 🪶

Wingdex is a React Native mobile application built with Expo that acts as a real-world "Pokédex" for birds. It allows users to take pictures of birds they encounter, identify them using advanced computer vision, learn about their biology through rich data, and track their sightings over time to earn XP.

## 🌟 Features

* **AI Bird Identification**: Seamlessly identifies bird species from your photos using the iNaturalist Computer Vision API.
* **Rich Biological Data**: Automatically fetches dynamic data (lore, diet, flight, habitat) for identified species via a Wikipedia scraping pipeline, replacing generic placeholder text.
* **Personalized Sighting Library**: Keeps a comprehensive log of all your bird sightings, including confidence levels, rarity, location (latitude/longitude), and timestamps.
* **Gamification**: Earn XP for every new sighting and build your ultimate Wingdex.
* **Secure Authentication**: User registration and login powered by JWT and bcrypt.
* **Beautiful UI/UX**: Custom React Native UI featuring beautiful gradients, interactive components, and smooth navigation.

## 🛠️ Technology Stack

**Frontend**
* [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
* [Expo Router](https://docs.expo.dev/router/introduction/) (for navigation)
* [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/) & [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
* [React Native Maps](https://github.com/react-native-maps/react-native-maps)
* [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (local caching)

**Backend**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [Prisma ORM](https://www.prisma.io/) with SQLite
* [Multer](https://github.com/expressjs/multer) (for handling image uploads)
* External APIs: [iNaturalist API](https://api.inaturalist.org/v1/docs/), Wikipedia API, Gemini API

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
* Node.js (v18+)
* npm or yarn
* [Expo Go](https://expo.dev/client) app installed on your mobile device (iOS/Android)

### 1. Backend Setup

Navigate to the `backend` directory and install the dependencies:
```bash
cd backend
npm install
```

Set up your database schema using Prisma:
```bash
npx prisma migrate dev
```

Create a `.env` file in the `backend` directory with the following variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_here"
INAT_TOKEN="your_inaturalist_api_token"
# Optional depending on usage
GEMINI_API_KEY="your_gemini_api_key"
```

Start the backend development server:
```bash
npm run dev
```
The server will usually start at `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal, navigate to the root directory, and install dependencies:
```bash
cd Wingdex
npm install
```

Create a `.env` file in the **root** directory to point to your local backend IP:
```env
# Replace with your computer's local IP address (e.g., 192.168.x.x or 10.0.x.x)
EXPO_PUBLIC_API_URL="http://YOUR_LOCAL_IP:5000"
```

Start the Expo development server:
```bash
npx expo start
```

Scan the QR code shown in your terminal using the Expo Go app on your mobile device to open Wingdex!

## 📸 Screenshots

*(You can add screenshots of your mobile application here to showcase the UI)*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the ISC License.
