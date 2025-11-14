# 🎮 Bouvet Values Arcade

A fun, interactive mini-games arcade where each game represents a core Bouvet company value. Play solo or challenge friends in real-time multiplayer mode!

## 🌟 Games

### 1. Jordnær (Down to Earth) 🌍
Fall from the sky and navigate through the air! Avoid buzzwords and corporate jargon while collecting real customer needs. Use arrow keys or A/D to control your descent.

### 2. Entusiastisk (Enthusiasm) ⚡
Keep the energy high in this rhythm game! Press A, S, D, F keys to hit the notes as they fall. Build combos, avoid negativity blocks, and maintain your energy bar!

### 3. Delingskultur (Sharing Culture) 🤝
Share knowledge to succeed! Match knowledge blocks to their correct project needs. Click on blocks and slots to make matches. Complete levels before time runs out!

### 4. Frihet (Freedom) 🎨
Express your creativity in this sandbox builder! Select colored blocks and click to place them anywhere on the canvas. Build whatever you imagine - the more creative, the higher your score!

### 5. Troverdighet (Trust) 🎯
Spot the bullshit! Read statements and decide if they're credible or just consulting nonsense. You have 3 lives - use them wisely!

## 🏆 Features

### Single Player Mode
- **Global Leaderboard**: Compete with other players across all games
- **Score Tracking**: Your total score accumulates from all games played
- **Persistent Storage**: Scores are saved locally so you can come back anytime

### Multiplayer Mode 🔥 NEW!
- **Real-Time Competition**: Create or join game rooms with friends
- **Live Score Updates**: See everyone's scores update in real-time as they play
- **Avatar System**: Choose from 24 fun avatars to represent yourself
- **Shareable Room Links**: Share a room code or link to invite friends instantly
- **Player List**: Always see who's in the room and their current scores
- **Cross-Tab Sync**: Works across multiple browser tabs using BroadcastChannel API

### General
- **Beautiful Design**: Each game has its own unique color palette and aesthetic
- **Responsive**: Works on desktop browsers
- **5 Unique Games**: Each representing a Bouvet value

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### 🌐 Deploy to GitHub Pages (Share with Everyone!)

#### Quick Deploy:
```bash
./deploy.sh
```
Follow the prompts and it will guide you through deployment!

#### Manual Deploy:
1. **Create GitHub Repository**: Go to https://github.com/new
2. **Update Config**: Edit `vite.config.js` line 6 to match your repo name
3. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```
4. **Enable GitHub Pages**: Settings → Pages → Source: "GitHub Actions"
5. **Your game is live!** `https://YOUR_USERNAME.github.io/YOUR_REPO/`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions including Firebase multiplayer setup.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎯 How to Play

### Single Player
1. **Select Single Player** from the home screen
2. **Choose a Game**: Click on any game card
3. **Read Instructions**: Each game shows instructions before starting
4. **Play**: Follow the game-specific controls and mechanics
5. **Submit Score**: Enter your name after finishing to save your score
6. **Compete**: Check the global leaderboard to see how you rank!

### Multiplayer
1. **Select Multiplayer** from the home screen
2. **Set Up Your Profile**:
   - Enter your name
   - Choose an avatar
3. **Create or Join a Room**:
   - **Create**: Start a new room and get a unique room code
   - **Join**: Enter an existing room code to join friends
4. **Share the Room**:
   - Copy the room link or share the room code with friends
   - They can paste the link in their browser or enter the code
5. **Select a Game**: The host can choose which game to play
6. **Compete Live**: 
   - Everyone plays the same game simultaneously
   - Watch live scores update on the player list
   - See who's winning in real-time!
7. **Play Again**: After finishing, you can play another round or return to lobby

### Multiplayer Tips
- 💡 Open the game in multiple browser tabs to test multiplayer yourself
- 💡 The player list panel can be collapsed/expanded using the arrow button
- 💡 Room codes are 6 characters and automatically expire after 1 hour of inactivity
- 💡 The host (first player) can be reassigned if they leave

## 🎨 Color Palette

- Primary: `#FF6B6B` (Coral Red)
- Secondary: `#4ECDC4` (Turquoise)
- Accent: `#FFE66D` (Yellow)
- Earth Green: `#2ECC71`
- Enthusiasm Pink: `#E056FD`
- Sharing Blue: `#3498DB`
- Freedom Yellow: `#F9CA24`
- Trust Red: `#EB3B5A`

## 🛠️ Technology Stack

- **React 18**: Modern UI library with hooks
- **Vite**: Fast build tool and dev server
- **CSS3**: Custom styling with animations
- **LocalStorage**: For persistent data (leaderboard & multiplayer rooms)
- **BroadcastChannel API**: Real-time communication across browser tabs
- **JavaScript ES6+**: Modern JavaScript features

## 📁 Project Structure

```
cursor/
├── src/
│   ├── components/
│   │   ├── HomePage.jsx
│   │   ├── MultiplayerLobby.jsx
│   │   ├── MultiplayerGame.jsx
│   │   ├── PlayerList.jsx
│   │   ├── AvatarSelector.jsx
│   │   └── games/
│   │       ├── JordnaerGame.jsx
│   │       ├── EntusiastiskGame.jsx
│   │       ├── DelingskultureGame.jsx
│   │       ├── FrihetGame.jsx
│   │       └── TroverdighetGame.jsx
│   ├── styles/
│   │   ├── styles.css
│   │   ├── avatar.css
│   │   ├── lobby.css
│   │   ├── multiplayer-game.css
│   │   ├── jordnaer.css
│   │   ├── entusiastisk.css
│   │   ├── delingskultur.css
│   │   ├── frihet.css
│   │   └── troverdighet.css
│   ├── utils/
│   │   ├── leaderboard.js
│   │   └── multiplayer.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 🎮 Game Controls

- **Jordnær**: Arrow keys or A/D to move left/right
- **Entusiastisk**: A, S, D, F keys to hit notes
- **Delingskultur**: Mouse clicks to select and match blocks
- **Frihet**: Mouse clicks to place blocks on canvas
- **Troverdighet**: Mouse clicks to choose answers

## 🏅 Scoring System

### Single Player
- Each game has its own scoring mechanics
- Scores from all games contribute to your total leaderboard score
- Bonuses for combos, streaks, and creative solutions
- Top 10 players are shown on the global leaderboard

### Multiplayer
- Real-time score updates visible to all players
- Each player's current score shows in the player list
- Compete to see who can get the highest score!
- Scores update live as you play (refreshes every 2 seconds)

## 🔧 Multiplayer Technical Details

The multiplayer system uses localStorage combined with the BroadcastChannel API to enable real-time gameplay:

- **LocalStorage**: Stores room data, player information, and game state
- **BroadcastChannel**: Broadcasts updates across browser tabs in real-time
- **Auto-sync**: Rooms refresh every 2 seconds to show latest player data
- **Activity Tracking**: Players send heartbeats every 5 seconds to stay active
- **Room Expiry**: Inactive rooms automatically clean up after 1 hour

### Current Limitations
- Multiplayer works across browser tabs on the **same device/browser profile**
- For true cross-device multiplayer, you would need a backend server
- This is designed as a fun same-device/local network multiplayer experience
- Perfect for office gaming sessions where friends open the link on their devices!

## 🎉 Have Fun!

This arcade is designed to be fun, fast-paced, and engaging. Challenge your colleagues, climb the leaderboard, and most importantly - have a blast! 🚀

---

Made with ❤️ for Bouvet

