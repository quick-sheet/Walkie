# Walkie

A child's bedside walkie-talkie and sleep log, linked to her parents' phones.

Live at **https://quick-sheet.github.io/Walkie/**

- **Her phone:** one big hold-to-talk button and picture buttons (Water, Toilet, Bad dream, Cuddle, Love you, Night night / I'm awake). At bedtime the screen turns black with a dim red clock and a moon, which turns into a sun at wake-up time.
- **Your phones:** her messages arrive as ntfy notifications, with reply buttons. In the app you can listen, hold to talk back (slide left to cancel, slide up to keep recording), see who has heard what, and see her nights on the Sleep page.
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

## Update

1. In the repo: **Add file → Upload files**, choose the changed files, **Commit changes**.
2. Wait about a minute (**Actions** shows a green tick when it's live).
3. Fully close Walkie and reopen it. If it looks the same, close and reopen once more. On her pinned phone, unpin first (hold Back and Overview), close it, reopen and pin again.

Every release bumps `core.js?v=N` in `index.html` and `walkie-vN` in `sw.js` together. When `Code.gs` changes, also go to **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy** (same URL).

## Files

| File | What it does |
| --- | --- |
| `index.html` | The whole app: setup and pairing, her screen, your Talk and Sleep pages |
| `core.js` | Pure logic: OK-to-wake clock, nights and averages, pairing link, QR code, daily allowance |
| `sw.js` | Offline support and instant updates |
| `manifest.webmanifest`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Install to the home screen |
| `apps-script/Code.gs`, `apps-script/appsscript.json` | The sleep log, deployed in Apps Script |

## Good to know

- **Privacy:** voice clips and the messages between the phones are sealed with your family's key before they leave the phone, so ntfy only stores noise. Notification texts never include her name. ntfy deletes voice clips after 3 hours; the Sheet stores what happened and when, never audio.
- **ntfy's free limit** is 250 messages a day for your whole home Wi-Fi (all phones together, Overhead included), reset at midnight UTC. Her phone keeps to 70 by day, so the evening and night always have room, and holds nothing back at night. If she uses up the daytime share, her buttons rest until bedtime and you get one notification saying so. Bad dream and Cuddle always go.
- **Gone quiet:** her phone keeps a "Walkie has gone quiet" message waiting on ntfy and keeps pushing it back. If it stops (off, flat, off the Wi-Fi, or Walkie closed), the message arrives: at night within 50 minutes, by day at 20 minutes after bedtime, so you know before she goes to bed. "Walkie's back" follows when it returns.
- **If the Sheet can't be opened** (for example, it was deleted), the log shows an error rather than quietly starting a new one. To start a fresh Sheet, delete `SHEET_ID` under Project Settings, Script Properties.
- **Your phone won't speak by itself.** A web app can't play sound on a locked phone, so you get the notification and tap to listen, or use the reply buttons right in the notification.
- **Her screen stays on** while Walkie is open. Keep her phone plugged in, on a hard surface.
- **Android "Tap to copy the URL for this app":** if every launch of the installed app plays a sound and shows that Chrome notification, long-press the notification and turn off the **Full screen site controls** category. ntfy messages are unaffected.
