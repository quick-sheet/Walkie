# Walkie

A child's bedside walkie-talkie and sleep log, linked to her parents' phones.

Live at **https://quick-sheet.github.io/Walkie/**

- **Her phone:** one big hold-to-talk button and picture buttons (Water, Toilet, Bad dream, Cuddle, Love you, Night night / I'm awake). At bedtime the screen turns black with a dim red clock and a moon, which turns into a sun at wake-up time. Along the bottom: 📖 stories and songs you've sent, 🎵 your Spotify playlists (once set up), 🎧 sleepy sounds (white, grey, brown noise or rain, for 15, 30 or 60 minutes or until morning) and ⭐ a calm breathing star; in the daytime also 🎨 drawing to send to you and 🎮 your games; at night also 🔦 a night light. She earns a ⭐ for each night she stays in bed until the sun, sees moons counting the sleeps to something special, ticks off bedtime routine pictures, and in the daytime picks her colours with the round colour button: 🍦 pastel, 🎈 cartoon, 🌙 classic, or ✏️ her own background and button (Walkie keeps the text readable and won't let the button disappear into the background).
- **Your phones:** her messages arrive as ntfy notifications, with reply buttons. With Walkie open in front of you, her voice messages play out loud as they arrive. In the chat, her messages carry her name (**Settings → Child's name**), yours say **Me**, and the other parent's carry their name. The header stays at the top with three tabs: **Talk** (listen, hold to talk back, slide left to cancel, slide up to keep recording, see who has heard what, her drawings), **Sleep** (her nights, with stars) and **Her phone** (start, pause or stop sounds, music and stories on her phone, pick her Spotify playlists, record or send stories, games on or off and her daily game time, the countdown and her routine pictures). When you reply On my way, she sees a woman running for Mummy or Mum and a man running for Daddy or Dad.
- **Sleep log:** every tap and message is saved to a Google Sheet of your own, through a small Apps Script.

## Host

1. **Apps Script first** (a computer is easiest):
   1. Go to script.google.com, choose **New project** and rename it `Walkie`.
   2. Paste `apps-script/Code.gs` over the default file. In **Project Settings**, tick **Show "appsscript.json" manifest file in editor**, then paste `apps-script/appsscript.json` into it.
   3. **Deploy → New deployment → Web app.** Execute as **Me**, Who has access **Anyone**. **Deploy**, approve, and copy the **Web app URL**.
   4. The Sheet ("Walkie log") is made in your Drive the first time a phone connects. Connect straight after deploying: the first family to connect owns the log.
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

**While music plays:** a small record with the song's cover turns at the top left of her screen (next to Home in her other pages). She taps it for back, pause, next and stop. On your phones a slim player under the header shows the playlist, its cover, whether it's playing or paused and where, with pause, next and stop; **Her phone → Music** also has pause and stop on the playlist that's playing. Her phone tells yours only when music starts, pauses, stops or moves (not each song), to save messages. When you press play, your phone shows it playing straight away; her phone's report then confirms it (on a day her messages are used up it can't, and your phone stops showing it after 10 minutes).

**Her songs:** once a playlist or album is playing, its songs slide in as big covers under the play buttons; the one playing glows with dancing bars and stays in the middle, and she taps any cover to play from there. Spotify lets apps like this list the whole playlist only when her account owns it or is a collaborator, so for a playlist made on your account: in Spotify, playlist → ⋯ → **Invite collaborators**, and accept the invite signed in as her (once per playlist). Until then she sees the song playing and the next 20 from Spotify's queue. Albums always list in full.

**Play on (daytime):** on her music page, the **Play on** button lists her phone and any speaker, TV or computer that is signed in to her Spotify account (an Amazon Echo with her account linked in the Alexa app, Sonos, a TV or games console with the Spotify app, the Spotify app on a computer). She taps one and the music moves there; pause, next, how loud, the night fade and Stop all work wherever it plays. A web page can't search your Wi-Fi for Chromecasts the way Spotify's own app does, so a Chromecast or Google Nest speaker only appears while it's already playing her Spotify; she can then join it and steer it. After Stop, and at bedtime, her music starts on her phone again.

Good to know: update all three phones to release 9 before setting up Spotify. Sign in on her phone with her email and password (the Google or Apple buttons open pop-ups the kiosk may block). Do the first play with a grown-up there: Chrome may ask once to allow protected content, and it must be allowed. If her settings say Chrome couldn't start Spotify's player, check Chrome → Settings → Site settings → Protected content is allowed. Use playlists you made (Spotify doesn't let apps like this play its own editorial playlists such as "Today's Top Hits"; copy the songs into your own playlist instead). At night music fades out after half an hour. Music on her phone pauses while she talks or while your voice message plays (music on a speaker carries on). Spotify's developer rules allow up to 5 people per app and need the app owner (you) to keep Premium.

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

Every release bumps `core.js?v=N` in `index.html` and `walkie-vN` in `sw.js` together. **Settings** shows the release at the top ("Walkie release 9"), so you can see when a phone has the update. When `Code.gs` changes, also paste it into Apps Script and go to **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy** (same URL). **Settings → Sleep log → Check** then shows the Apps Script release.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The whole app: setup and pairing, her screen and its extras, your Talk, Sleep and Her phone pages |
| `games.json` | Her games: name, address, icon, and whether each is ready |
| `core.js` | Pure logic: OK-to-wake clock, nights and averages, stars, countdown, routine, games list and game time, pairing link, QR code, daily allowance |
| `sw.js` | Offline support and instant updates |
| `manifest.webmanifest`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Install to the home screen |
| `apps-script/Code.gs`, `apps-script/appsscript.json` | The sleep log, deployed in Apps Script |

## Good to know

- **Spotify** knows what she plays (it's her account). Walkie keeps her Spotify sign-in on her phone only; your phones see the playlist names and, while music plays, which playlist, whether it's paused and where, sealed like everything else.
- **Privacy:** voice clips, stories, drawings and the messages between the phones are sealed with your family's key before they leave the phone, so ntfy only stores noise. Notification texts never include her name; it only shows inside the app. ntfy deletes uploads after 3 hours; the Sheet stores what happened and when, never audio or pictures.
- **Stories** are kept on her phone once they arrive (up to 24; the oldest goes when a new one arrives). If her phone can't download one straight away it keeps trying, but ntfy only keeps uploads for 3 hours; after that your Her phone page says it didn't arrive. ntfy takes files up to 2 MB, which is about 8 minutes of recording; for a longer song, send an MP3 under 2 MB. Leaving the family on her phone deletes them.
- **Stars** are counted on her phone from her own buttons, starting from the first night after this update, and shown on your Sleep page too: Night night at bedtime, then no I'm awake until the sun is up. A bad dream or a cuddle in the night doesn't cost the star; pressing I'm awake while the moon is still up does.
- **Sounds and stories play on her phone only while Walkie is open on it** (as it always is by her bed). They pause while she holds the talk button. Commands from your phone that arrive more than 10 minutes late are ignored, so nothing starts out of the blue. Her phone reports what's playing within seconds while you're controlling it, otherwise at most once a minute, to save ntfy's daily messages.
- **ntfy's free limit** is 250 messages a day for your whole home Wi-Fi (all phones together, Overhead included), reset at midnight UTC. Her phone keeps to 70 by day, so the evening and night always have room, and holds nothing back at night. Reports about what's playing stop 30 short, so the last 30 are always there for her talking and picture buttons. If she uses up the daytime share, her buttons rest until bedtime and you get one notification saying so; Bad dream and Cuddle always go. For a busy day (testing, say), **Settings → Her messages by day** raises her share to 100, 150 or 200 straight away, on both parents' phones and hers; set it back to 70 afterwards, because if the 250 run out, messages stop for everyone until midnight.
- **Gone quiet:** her phone keeps a "Walkie has gone quiet" message waiting on ntfy and keeps pushing it back. If it stops (off, flat or off the Wi-Fi), the message arrives: at night within 50 minutes, by day at 20 minutes after bedtime, so you know before she goes to bed. If Walkie is closed, hidden or its screen switched off, you hear sooner: "Walkie isn't on her screen" after 2 minutes. "Walkie's back" follows when it returns.
- **If the Sheet can't be opened** (for example, it was deleted), the log shows an error rather than quietly starting a new one. To start a fresh Sheet, delete `SHEET_ID` under Project Settings, Script Properties.
- **Your phone won't speak by itself.** A web app can't play sound on a locked phone, so you get the notification and tap to listen, or use the reply buttons right in the notification.
- **Her screen stays on** while Walkie is open. Keep her phone plugged in, on a hard surface.
- **Android "Tap to copy the URL for this app":** if every launch of the installed app plays a sound and shows that Chrome notification, long-press the notification and turn off the **Full screen site controls** category. ntfy messages are unaffected.
