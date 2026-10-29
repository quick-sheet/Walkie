# Walkie

A child's bedside walkie-talkie and sleep log, linked to her parents' phones.

Live at **https://quick-sheet.github.io/Walkie/**

- **Her phone:** one big hold-to-talk button (and a smaller one at the top of every one of her pages: hold to talk, slide sideways to throw it away, or slide down to the lock to keep recording with her finger off, then tap it to send or ✕ not to) and picture buttons (Water, Toilet, Bad dream, Cuddle, Love you, Night night / I'm awake). At bedtime the screen turns black with a dim red clock and a moon, which turns into a sun at wake-up time. Along the bottom: 📖 stories and songs you've sent, 🎵 your Spotify playlists (once set up), 🎧 sleepy sounds (white, grey, brown noise or rain, for 15, 30 or 60 minutes or until morning) and ⭐ a calm breathing star; in the daytime also 🎨 drawing to send to you (felt pen, crayon, paintbrush, spray, rainbow pen and rubber in a tray, four thicknesses, ten colours and undo), 🎮 your games and 📺 videos to pick for the TV; at night also 🔦 a night light. She earns a ⭐ for each night she stays in bed until the sun, sees moons counting the sleeps to something special, ticks off bedtime routine pictures, and in the daytime picks her colours with the round colour button: 🍦 pastel, 🎈 cartoon, 🌙 classic, or ✏️ her own background and button (Walkie keeps the text readable and won't let the button disappear into the background).
- **Your phones:** her messages arrive as ntfy notifications, with reply buttons. With Walkie open in front of you, her voice messages play out loud as they arrive. In the chat, her messages carry her name (**Settings → Child's name**), yours say **Me**, and the other parent's carry their name. Your pages run along the bottom: **Talk**, **Sleep** and **Music** on the left, **her phone** (shown with her name from **Settings → Child's name**) and **Games** on the right, with a big talk button in the middle: hold it and talk, let go to send (a quick tap sends nothing). While you hold it, slide sideways to throw the message away, or slide up to the lock to keep recording with your finger off; the button turns into Send, so tap it to send (or **Cancel**). It's there on every page, and on your games (there the button sits at the top, so slide down to lock). **Talk** is the chat: her latest voice message you haven't heard sits just above the talk button to play without scrolling, with On my way, Love you and Back to sleep beside it; swipe one of her messages to the right and the three replies come out from under it, to answer that message; hold any message for Play again, See it big, or the replies; her screen going off and coming back folds into one quiet line; day labels stay at the top as you scroll. **Sleep** shows her nights, with stars. **Music** is the same page as her music page (see below), steering her phone through Spotify. Her phone's page lets you start, pause or stop sounds, music and stories on her phone, pick her Spotify playlists, record or send stories, turn games on or off and set her daily game time, set up her Videos, the countdown and her routine pictures. **Games** has the same games as hers, for you, full screen, as long as you like (nothing goes to her phone). When you reply On my way, she sees a woman running for Mummy or Mum and a man running for Daddy or Dad.
- **Videos:** your search words (up to 8, e.g. "Bluey") become buttons on her phone, each with 20 YouTube videos, found with YouTube's strict safe search. She taps the ❤️ on the ones she'd like and taps Send. You get one notification, "Videos to watch": tap it and YouTube opens with her picks lined up, then tap YouTube's Cast button to put them on the TV. The list also waits in Talk, with **Open in YouTube**. Nothing plays on her phone. Her ❤️ tab keeps what she's sent before. On her phone's page (**Videos**), tap a search word to see what it finds and hide a video, or everything from its channel. Daytime only. Without YouTube Premium, YouTube shows its usual adverts on the TV. The lined-up list uses an older YouTube link that still works but isn't official; if YouTube ever opens only the first video, the others are a tap each in Talk, and YouTube offers **Add to queue** while you're casting.
- **Sleep log and post box:** every tap and message is saved to a Google Sheet of your own, through a small Apps Script. The same Apps Script is a post box: settings, her "what's on" reports, her story and music lists, stars, "heard" receipts and her video picks go through it instead of ntfy, so they don't use ntfy's daily messages (see Good to know). It also does the YouTube searches for Videos.

## Host

1. **Apps Script first** (a computer is easiest):
   1. Go to script.google.com, choose **New project** and rename it `Walkie`.
   2. Paste `apps-script/Code.gs` over the default file. In **Project Settings**, tick **Show "appsscript.json" manifest file in editor**, then paste `apps-script/appsscript.json` into it. (It switches on Apps Script's YouTube service for Videos, read-only. No Google Cloud project or API key is needed.)
   3. Choose **setupYouTube** in the function list at the top and **Run**, and approve (Google warns the app isn't verified: it's your own script, so **Advanced → Go to Walkie**). This lets it search YouTube.
   4. **Deploy → New deployment → Web app.** Execute as **Me**, Who has access **Anyone**. **Deploy**, approve, and copy the **Web app URL**.
   5. The Sheet ("Walkie log") is made in your Drive the first time a phone connects. Connect straight after deploying: the first family to connect owns the log.
2. **GitHub:** a public repo `quick-sheet/Walkie` with these files at the top level, and **Settings → Pages →** Deploy from a branch, `main`, `/ (root)`.

## Install and pair

1. **First parent:** open the live URL in Chrome, install it (banner or ⋮ → Install app), open it from the icon and tap **Set up on this parent's phone**. Follow the ntfy steps, then in **Settings → Sleep log** paste the Web app URL and tap **Connect**.
2. **Her phone:** on the first parent's phone, **Settings → Show pairing code**. On her phone, open the camera (or Chrome's address bar camera) and scan it. Choose **Her bedside phone**, then follow the setup steps: allow the microphone, install, pin the screen, dim it, add your photos (press and hold the slider icon at the top right).
3. **Second parent:** scan the same code, choose **A parent's phone**, pick a name and follow the ntfy steps.

Anyone with the pairing link can join, so only use it on your own phones.

## Spotify

Her playlists play inside Walkie, through Spotify's own web player, so the kiosk can stay locked to Walkie. It needs Spotify Premium (your Family plan; not a mobile-only plan).

1. **Her account:** add her to your Family plan, and in her account settings turn off explicit content.
2. **A Spotify app (once, about 5 minutes):** at [developer.spotify.com](https://developer.spotify.com/dashboard), log in with your own account, choose **Create app** (any name, e.g. Walkie). As **Redirect URI** add exactly `https://quick-sheet.github.io/Walkie/` (Walkie shows it in **Settings → Spotify** with a Copy button). Tick **Web API** and **Web Playback SDK**, save. Under **User Management** add her Spotify account (name and email). Copy the app's **Client ID**.
3. **Your phone:** **Settings → Spotify**, paste the Client ID, **Save**.
4. **Her phone:** hold the slider icon → **Spotify → Sign in to Spotify**, and sign in with her account. If the kiosk blocks Spotify's sign-in page, pause the kiosk while you sign in. Her phone stays signed in; the Spotify sign-in details never leave her phone.
5. **Pick her music:** on your **Her phone** tab, **Music**: in Spotify use ⋯ → **Share → Copy link** on a playlist or album, paste it and **Add** (up to 12). The 🎵 button appears on her phone with the covers.
6. **Each parent's phone (once):** **Settings → Spotify → Sign in as her**, with her Spotify email and password. If Spotify's page shows your own name, tap **Not you?** first. Walkie tells you straight away if the account isn't hers. This is what lets your phone show and steer her music without using any ntfy messages.

**While music plays:** a small record with the song's cover turns at the top left of her screen (next to Home in her other pages). She taps it for back, pause, next and stop; her music page has the same buttons, Stop included. Your phones show the same record at the top left, before the Walkie name, on every page: tap it for the same buttons (they tuck away after 8 seconds, or with a tap anywhere else). On hers and yours, tap the cover beside the buttons to open the music page. **Her phone → Music** also has pause and stop on the playlist that's playing.

**Music costs no messages.** A phone signed in as her (step 6) asks Spotify itself what's playing, every 5 seconds while music plays and every 15 seconds otherwise, and only while Walkie is open in front of you. Your ▶, pause, back and next go straight to Spotify too. Her phone sends nothing about what's playing, so a busy day or a used-up allowance makes no difference. **Stop** sends one message, so her phone puts the music away; when she presses Stop herself, her phone sends one message so your records go too (Spotify alone only says "paused"). A phone not signed in as her still plays, pauses and stops by message, and shows what you started from it for 10 minutes; its Music card reminds you to sign in.

**Her music page:** her playlists sit at the top as square covers with their names. The song playing is a big record in the middle, turning while it plays, with its name, a line she can slide along to move through the song, and shuffle, back, play or pause, next and play-this-song-again. Under it, **Songs** shows the playlist's songs as little round records: the one playing turns and glows, and she taps any record to play from there. How loud and **Stop** are at the bottom. The headings are in Fredoka, a rounded, friendly typeface. **Your Music page** is the same: tap a playlist to play it on her phone (or the speaker she's playing on), and the song, the line to slide along, shuffle, play-it-again, the songs and how loud all go straight to Spotify, with no messages. It needs your phone signed in as her (step 6); without that, play, pause and stop still work by message and the page says how to get the rest. **Play on** stays on her phone. **Her songs:** Spotify lets apps like this list the whole playlist only when her account owns it or is a collaborator, so for a playlist made on your account: in Spotify, playlist → ⋯ → **Invite collaborators**, and accept the invite signed in as her (once per playlist). Until then she sees the song playing and the next 20 from Spotify's queue. Albums always list in full.

**Play on (daytime):** on her music page, the round **Play on** button at the top right (opposite Home) lists her phone and any speaker, TV or computer that is signed in to her Spotify account (an Amazon Echo with her account linked in the Alexa app, Sonos, a TV or games console with the Spotify app, the Spotify app on a computer). She taps one and the music moves there; pause, next, how loud, the night fade and Stop all work wherever it plays. A web page can't search your Wi-Fi for Chromecasts the way Spotify's own app does, so a Chromecast or Google Nest speaker only appears while it's already playing her Spotify; she can then join it and steer it. After Stop, and at bedtime, her music starts on her phone again.

Good to know: update all three phones to release 14 before setting up Spotify. Sign in on her phone with her email and password (the Google or Apple buttons open pop-ups the kiosk may block). Do the first play with a grown-up there: Chrome may ask once to allow protected content, and it must be allowed. If her settings say Chrome couldn't start Spotify's player, check Chrome → Settings → Site settings → Protected content is allowed. Use playlists you made (Spotify doesn't let apps like this play its own editorial playlists such as "Today's Top Hits"; copy the songs into your own playlist instead). At night music fades out after half an hour. Music on her phone pauses while she talks or while your voice message plays (music on a speaker carries on). Spotify's developer rules allow up to 5 people per app and need the app owner (you) to keep Premium.

## Keep her in Walkie

1. **Pin Walkie** (Android's own lock, there since Android 5): set a screen lock PIN on her phone, then in **Settings** search for **pinning** (it's under **Security**, or **Security & location**, **→ Advanced**) and turn it on, with **Ask for PIN before unpinning** if your version lists it. Open Walkie, tap the square Overview button (or swipe up and hold), tap the Walkie icon at the top of its card, then **Pin**. Unpinning takes Back and Overview held together, then your PIN.
2. **Tidy the phone:** disable every app she doesn't need (**Settings → Apps → the app → Disable**: YouTube, Play Store, Gmail and so on) and leave Walkie as the only icon on the home screen. Keep Chrome: Walkie runs on it.
3. **Walkie helps too:** on her phone it goes full screen at her first touch (hiding the status bar and the Back, Home and Recents buttons; switch this off in her settings if it ever gets in the way), Back stays inside Walkie, and if Walkie is closed or hidden for 2 minutes you get "Walkie isn't on her screen".
4. **After a restart** (power cut, Android update) the pin is gone and the phone waits on your PIN: unlock, open Walkie and pin it again. You'll have had a "Walkie has gone quiet" alert meanwhile.

## Games

Her games open inside Walkie, full screen, in the daytime only. They're listed in `games.json` in this repo:

```json
{ "id": "wolfsheep", "name": "Wolf & Sheep", "emoji": "🐺", "url": "../WolfSheep/", "icon": "../WolfSheep/icon-192.png", "ready": true }
```

- `url` and `icon` must be on quick-sheet.github.io (the same site as Walkie); anything else is ignored. `../Name/` means `https://quick-sheet.github.io/Name/`.
- `"ready": false` shows the game greyed out with a lock; change it to `true` (and set the right `url` and `icon`) when the game is live. Editing `games.json` needs no new Walkie release: her phone picks it up within a few hours, or straight away with **Check for update** in her settings.
- Each game needs Wi-Fi the first time she opens it, then works offline (if the game itself does).
- Game time: set on your **Her phone** tab (20 min, 30 min, 1 hour or no limit, 30 min to start). When it runs out the game closes and her games show 🎮💤→☀️ until tomorrow. A game also closes at bedtime, if you switch games off, or after 5 minutes without a touch.

## Update

1. In the repo: **Add file → Upload files**, choose the changed files, **Commit changes**.
2. Wait about a minute (**Actions** shows a green tick when it's live).
3. On each phone, open **Settings** and tap **Check for update** next to the release number at the top (on her phone: press and hold the slider icon). No need to unpin her phone. If the release number hasn't changed, wait a minute and tap it again.

Every release bumps `core.js?v=N` in `index.html` and `walkie-vN` in `sw.js` together. **Settings** shows the release at the top ("Walkie release 15"), so you can see when a phone has the update.

**When `Code.gs` changes** (release 15 needs Apps Script release 3):
1. In Apps Script, paste the new `Code.gs` over the old one. In **Project Settings**, tick **Show "appsscript.json" manifest file in editor** if it isn't, and paste `appsscript.json` over that file too. Save.
2. Choose **setupYouTube** in the function list at the top, **Run**, and approve (Google warns the app isn't verified: it's your own script, so **Advanced → Go to Walkie**).
3. **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy.** The URL stays the same.
4. On your phone, **Settings → Sleep log → Check** shows "Apps Script release 3, up to date", and, once her phone is on release 15 and open, that settings and reports go through it, not ntfy.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The whole app: setup and pairing, her screen and its extras, your Talk, Sleep and Her phone pages |
| `games.json` | Her games: name, address, icon, and whether each is ready |
| `core.js` | Pure logic: OK-to-wake clock, nights and averages, stars, countdown, routine, games list and game time, pairing link, QR code, daily allowance |
| `sw.js` | Offline support and instant updates |
| `manifest.webmanifest`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Install to the home screen |
| `apps-script/Code.gs`, `apps-script/appsscript.json` | The sleep log, the post box and the YouTube search for Videos, deployed in Apps Script |

## Good to know

- **Spotify** knows what she plays (it's her account). Each phone signed in to her Spotify keeps its own sign-in on that phone; sign-ins never go through ntfy. Signing out on one phone (**Settings → Spotify → Sign out on this phone**) leaves the others signed in.
- **Privacy:** voice clips, stories, drawings and the messages between the phones are sealed with your family's key before they leave the phone, so ntfy only stores noise. Notification texts never include her name; it only shows inside the app. ntfy deletes uploads after 3 hours; the Sheet stores what happened and when, never audio or pictures.
- **Stories** are kept on her phone once they arrive (up to 24; the oldest goes when a new one arrives). If her phone can't download one straight away it keeps trying, but ntfy only keeps uploads for 3 hours; after that your Her phone page says it didn't arrive. ntfy takes files up to 2 MB, which is about 8 minutes of recording; for a longer song, send an MP3 under 2 MB. Leaving the family on her phone deletes them.
- **Stars** are counted on her phone from her own buttons, starting from the first night after this update, and shown on your Sleep page too: Night night at bedtime, then no I'm awake until the sun is up. A bad dream or a cuddle in the night doesn't cost the star; pressing I'm awake while the moon is still up does.
- **Sounds and stories play on her phone only while Walkie is open on it** (as it always is by her bed). They pause while she holds the talk button. Commands from your phone that arrive more than 10 minutes late are ignored, so nothing starts out of the blue. Her phone reports which story, sound or game is on within seconds while you're controlling it, otherwise at most once a minute. These reports go through the post box; your phone looks for them every half a minute, every 8 seconds on her phone's page and just after you've sent her phone something.
- **Talking:** recording carries on for half a second after the talk button is let go, on her phone and yours, so the last word isn't clipped.
- **The clock screen** covers her whole screen, including the strips behind Android's status and navigation bars, so nothing of Walkie shows above or below it.
- **The post box:** your Apps Script holds settings and reports for the phones to collect, so they cost no ntfy messages. Her phone looks every 20 seconds by day and every minute at night, so a settings change (games on or off, the countdown, her playlists, Videos) reaches her phone within about half a minute. What has to arrive at once or wake a phone still goes by ntfy: her taps, voice and drawings, your replies and voice, your play, pause and stop for her sounds, stories and music, and the gone-quiet alert. If the Apps Script can't be reached, Walkie uses ntfy instead.
- **A change that can't go** (no connection, or ntfy's daily limit used up) is kept and goes by itself: within a few minutes, or just after midnight UTC for the limit. The message on screen says which.
- **A mistake in `games.json`** (a missing comma, say) shows on your Games page and your Her phone page, with the line it's on. Until it's fixed, her phone keeps the games it had.
- **ntfy's free limit** is 250 messages a day for your whole home Wi-Fi (all phones together, Overhead included), reset at midnight UTC. Her phone keeps to 70 by day, so the evening and night always have room, and holds nothing back at night. Reports about what's playing stop 30 short, so the last 30 are always there for her talking and picture buttons. If she uses up the daytime share, her buttons rest until bedtime and you get one notification saying so; Bad dream and Cuddle always go. For a busy day (testing, say), **Settings → Her messages by day** raises her share to 100, 150 or 200 straight away, on both parents' phones and hers; set it back to 70 afterwards, because if the 250 run out, messages stop for everyone until midnight.
- **Gone quiet:** her phone keeps a "Walkie has gone quiet" message waiting on ntfy and keeps pushing it back. If it stops (off, flat or off the Wi-Fi), the message arrives: at night within 50 minutes, by day at 20 minutes after bedtime, so you know before she goes to bed. If Walkie is closed, hidden or its screen switched off, you hear sooner: "Walkie isn't on her screen" after 2 minutes. "Walkie's back" follows when it returns.
- **If the Sheet can't be opened** (for example, it was deleted), the log shows an error rather than quietly starting a new one. To start a fresh Sheet, delete `SHEET_ID` under Project Settings, Script Properties.
- **Your phone won't speak by itself.** A web app can't play sound on a locked phone, so you get the notification and tap to listen, or use the reply buttons right in the notification.
- **Her screen stays on** while Walkie is open. Keep her phone plugged in, on a hard surface.
- **Android "Tap to copy the URL for this app":** if every launch of the installed app plays a sound and shows that Chrome notification, long-press the notification and turn off the **Full screen site controls** category. ntfy messages are unaffected.
