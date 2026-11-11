# Steam demo checklist

What a demo needs to be accepted and to hold up in front of players, and where this project stands.
Version 0.6.0.

## Done in the game

| Requirement | Status |
|---|---|
| Title screen and main menu (Continue, New, Load, Settings, How to play, Credits, Quit) | Done |
| Three save slots with company, day and net worth; delete; overwrite warning | Done |
| Settings: volume, mute, text size, pause on focus loss, tips, fullscreen | Done |
| Pause menu on Esc and a menu button for touch | Done |
| Guided first day (10 steps, skippable, replayable) and one-off tips | Done |
| Demo limits behind one flag: one depot, Standard scenario only, ends after day 14 with a wishlist button | Done |
| Crash guard: errors pause the game and show a reload screen instead of freezing | Done |
| Version number on the title screen | Done |
| Credits and a statement that all names are invented | Done |
| Works at 1280x800 (Steam Deck), 1080p and above; mouse, keyboard and touch | Layout done, not tested on a Deck |
| Steam achievements wired to the ten in-game achievements | Code written, needs your app id to test |

## Desktop build

`desktop/` holds an Electron wrapper (window, F11 fullscreen, quit, optional Steam).
It has not been built or run yet: the Pi has no Node.js and can't open a window.

To build on GitHub: give the `gh` login the `workflow` permission
(`gh auth refresh -h github.com -s workflow`), move `desktop/ci-workflow.yml` to
`.github/workflows/desktop.yml`, push, and run it from the Actions tab.

To build on your own PC: install Node.js 20, then in `desktop/` run `npm install` and `npm run dist`.
`npm run start:demo` runs it without packaging.

The build is the demo unless a file named `FULL` sits beside `main.js`.

## Needs you (Valve won't accept these from anyone else)

1. Steamworks account: identity, tax and bank details, US$100 app fee.
2. Create the app and a separate demo app id. Put the id in `desktop/steam_appid.txt`.
3. In Steamworks, create ten achievements named `ACH_PROFIT`, `ACH_FULL`, `ACH_TEN`, `ACH_DEP2`,
   `ACH_DROPS`, `ACH_ONTIME`, `ACH_COLD`, `ACH_REG`, `ACH_GOLD`, `ACH_ALL`.
4. Replace the wishlist link in `shell.js` (`PF.wishlist`) with your store page.
5. Content survey, pricing, release date, support email.
6. Upload the build with SteamPipe and submit it and the store page for review (allow a week;
   the page must be public for two weeks before release).

## Store page assets still to make

- Capsule art: header 920x430, small 462x174, main 1232x706, vertical 748x896, library 600x900 and 3840x1240, logo.
- At least five 1920x1080 screenshots. Draft ones are in `store/`.
- A trailer (30 to 60 seconds of play is enough for a demo).
- Short description (under 300 characters) and a long description.

## Not good enough yet

These won't block Valve's review, but players will judge the demo on them.

- Art: everything is drawn as flat shapes. No sprites, no animation beyond movement.
- Sound: a few synthesised beeps. No music, no engine or forklift sounds.
- Balance: tuned by simulation only. No human playtesting.
- Mid-day saving: the game saves at the end of each day only.
- Controller support: none. Steam Deck works by touch and trackpad.
- Localisation: English only.
- Code: three large files, no automated tests.
