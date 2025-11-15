# 🎵 Adding Background Music

## Step 1: Download the Audio from YouTube

You shared this YouTube link: https://www.youtube.com/watch?v=1qN72LEQnaU

### Option A: Use a YouTube to MP3 Converter (Recommended)

1. Go to one of these sites:
   - **https://ytmp3.nu/** (fast, no ads)
   - **https://yt5s.io/** (reliable)
   - **https://y2mate.com/** (popular)

2. Paste your YouTube URL: `https://www.youtube.com/watch?v=1qN72LEQnaU`

3. Click **"Convert"** or **"Download"**

4. Save the file as `music.mp3`

### Option B: Use Command Line (if you have yt-dlp)

```bash
# Install yt-dlp if you don't have it
brew install yt-dlp

# Download audio
yt-dlp -x --audio-format mp3 -o "music.%(ext)s" "https://www.youtube.com/watch?v=1qN72LEQnaU"
```

---

## Step 2: Add Music to Your Project

1. Move the downloaded `music.mp3` file to your project's **`public`** folder:

```bash
mv ~/Downloads/music.mp3 /Users/kjartan.kristjansson/Projects/AI/cursor/public/
```

2. **Optional:** For better browser compatibility, also add an `.ogg` version:
   - Use https://convertio.co/mp3-ogg/ to convert
   - Save as `music.ogg` in the `public` folder

---

## Step 3: Test Locally

```bash
cd /Users/kjartan.kristjansson/Projects/AI/cursor
npm run dev
```

1. Open http://localhost:5173/
2. You should see a **🔊** button in the top-right corner
3. Click it to toggle sound on/off
4. The music should start playing!

---

## Step 4: Deploy to GitHub Pages

```bash
git add .
git commit -m "Add background music with sound toggle"
git push origin main
```

Wait 2 minutes for GitHub Actions to deploy, then your music will play on the live site!

---

## 🎵 Features

- **Persistent Mute Preference**: Your mute choice is saved to localStorage
- **Auto-Loop**: Music loops continuously
- **Volume**: Set to 30% by default (adjustable in `BackgroundMusic.jsx`)
- **Fixed Position Button**: Sound toggle stays in top-right corner on all pages
- **Smooth Animations**: Button pulses and scales on hover

---

## 🎛️ Customization

Want to adjust the volume? Edit `src/components/BackgroundMusic.jsx`:

```javascript
audioRef.current.volume = 0.3; // Change to 0.1 - 1.0
```

Want different music? Just replace `public/music.mp3` with any other audio file!

---

## 📝 Notes

- **Autoplay Restrictions**: Some browsers block autoplay until user interaction. The button will work to start music.
- **File Size**: Try to keep the music file under 5MB for faster loading
- **Format Support**: MP3 works in all modern browsers. OGG is a fallback for older browsers.

Enjoy your arcade soundtrack! 🎮🎵

