# Camilla Game Assets Setup Guide

This guide explains how to download and set up all required assets for the "Who is Camilla" secret game.

## Required Images

All images should be placed in the `/public` folder. Download transparent PNG versions (256px or 512px recommended).

### Power-Up Items (Energy Boosters) ⚡

These items give Camilla energy and points:

1. **monster-drink.png** - Monster Energy Drink
   - Search: "energy drink icon png transparent"
   - Suggested sources:
     - [Flaticon - Energy Drink](https://www.flaticon.com/search?word=energy%20drink)
     - [Vecteezy - Energy Drink](https://www.vecteezy.com/free-png/energy-drink)
     - Alternative: Use a simple can icon with lightning bolt

2. **hamster.png** - Cute Hamster
   - Search: "cute hamster icon png transparent"
   - Suggested sources:
     - [Flaticon - Hamster](https://www.flaticon.com/search?word=hamster)
     - [IconScout - Hamster](https://iconscout.com/icons/hamster)
     - Look for cute, cartoonish style

3. **cute-star.png** - Star Icon
   - Search: "cute star icon png transparent"
   - Suggested sources:
     - [Flaticon - Star](https://www.flaticon.com/search?word=star)
     - [Icons8 - Star](https://icons8.com/icons/set/star)
     - Choose a shiny, colorful star

4. **cute-heart.png** - Heart Icon
   - Search: "cute heart icon png transparent"
   - Suggested sources:
     - [Flaticon - Heart](https://www.flaticon.com/search?word=heart)
     - [Noun Project - Heart](https://thenounproject.com/search/icons/?q=heart)
     - Choose a vibrant, cute style

### Sleep Items (Energy Drainers) 😴

These items reduce Camilla's energy:

1. **sleep-bed.png** - Bed
   - Search: "bed icon png transparent"
   - Suggested sources:
     - [Flaticon - Bed](https://www.flaticon.com/search?word=bed)
     - [Icons8 - Bed](https://icons8.com/icons/set/bed)
     - Look for simple, recognizable bed icon

2. **sleep-pillow.png** - Pillow
   - Search: "pillow icon png transparent"
   - Suggested sources:
     - [Flaticon - Pillow](https://www.flaticon.com/search?word=pillow)
     - [Vecteezy - Pillow](https://www.vecteezy.com/free-png/pillow)
     - Choose a soft, comfortable-looking pillow

3. **sleep-pills.png** - Sleeping Pills
   - Search: "pills icon png transparent"
   - Suggested sources:
     - [Flaticon - Pills](https://www.flaticon.com/search?word=pills)
     - [Icons8 - Pills](https://icons8.com/icons/set/pills)
     - Medicine bottle or pill capsules work well

4. **sleep-zzz.png** - ZZZ Sleep Symbol
   - Search: "zzz sleep icon png transparent"
   - Suggested sources:
     - [Flaticon - Sleep](https://www.flaticon.com/search?word=sleep%20zzz)
     - [IconScout - ZZZ](https://iconscout.com/icons/zzz)
     - Classic comic-style "zzz" works best

## Background Music 🎵

Download an energetic, upbeat royalty-free music track:

**File name:** `camilla-music.mp3`
**Placement:** `/public/camilla-music.mp3`

### Recommended Free Music Sources:

1. **Incompetech** (Kevin MacLeod - CC BY License)
   - Website: https://incompetech.com/music/royalty-free/music.html
   - Suggested tracks:
     - "Acid Trumpet" - Energetic electronic
     - "Electro Sketch" - Upbeat techno
     - "Pixel Peeker Polka - Faster" - Fun, fast-paced
   - Download as MP3, rename to `camilla-music.mp3`

2. **Free Music Archive** (Various CC Licenses)
   - Website: https://freemusicarchive.org/
   - Search for: "electronic upbeat" or "energetic dance"
   - Filter by CC0 or CC BY licenses
   - Look for 2-3 minute loops

3. **Pixabay Music** (Free for commercial use)
   - Website: https://pixabay.com/music/
   - Search: "energetic", "party", "electronic"
   - No attribution required

4. **Bensound** (CC BY License)
   - Website: https://www.bensound.com/
   - Look in "Electronica" or "Dance" categories
   - Requires attribution in credits

## Image Attribution

If using images from Flaticon or similar sites with attribution requirements, you can add credits by creating a file:

**File:** `/public/CREDITS.md`

```markdown
# Asset Credits

## Icons
- Icons made by [Author Name] from www.flaticon.com
- [Additional attributions as needed]

## Music
- Music by [Artist Name] from [Source]
- License: [License Type]
```

## Quick Setup Steps

1. Create the following folder structure if it doesn't exist:
   ```
   /public/
   ```

2. Download all required images (8 total):
   - 4 power-up images
   - 4 sleep item images

3. Ensure all images are:
   - Transparent PNG format
   - 256px or 512px size (for good quality)
   - Named exactly as specified above

4. Download background music track:
   - MP3 format
   - 2-5 minutes duration (it will loop)
   - Moderate volume (around -12dB to -6dB)

5. Verify all files are in place:
   ```
   /public/
     ├── camilla.png (already exists)
     ├── Camilla_background.jpeg (already exists)
     ├── monster-drink.png
     ├── hamster.png
     ├── cute-star.png
     ├── cute-heart.png
     ├── sleep-bed.png
     ├── sleep-pillow.png
     ├── sleep-pills.png
     ├── sleep-zzz.png
     └── camilla-music.mp3
   ```

## Fallback: Placeholder Emoji Icons

If you want to test the game before downloading images, you can temporarily use emoji/text as placeholders. The game will still function (though images won't display).

## Testing

After adding all assets:

1. Navigate to: `http://localhost:5173/who-is-camilla`
2. Check browser console for any image loading errors
3. Verify music plays (you may need to interact with page first due to browser autoplay policies)
4. Test mute button functionality

## Troubleshooting

**Images not loading:**
- Check file names match exactly (case-sensitive)
- Verify files are in `/public/` folder, not `/public/assets/`
- Clear browser cache and reload

**Music not playing:**
- Check browser console for errors
- Verify file is MP3 format
- Some browsers block autoplay - user must click something first
- Try clicking the unmute button

**Blank canvas:**
- Open browser dev tools (F12)
- Check console for JavaScript errors
- Verify canvas element is rendering

## Alternative: No-Download Setup

If you prefer not to download assets immediately, the game will still run but items won't have images. Consider:
- Using emoji in place of images (modify code to use text instead)
- Running without music initially
- Adding a "loading" message if images fail

---

**Note:** All asset links and sources are provided as suggestions. Always verify licensing terms before using any assets, especially for commercial or public deployment.

