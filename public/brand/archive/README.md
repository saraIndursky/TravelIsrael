# Archived images

Images that used to be used on the site, kept so you can always go back to them
(they are also in the git history of this repository).

| File | Where it was used | Original source |
| --- | --- | --- |
| `home-hero-previous.jpg` | Home page hero background (`components/home/hero.tsx`) | https://images.unsplash.com/photo-1464822759023-fed622ff2c3b |
| `default-place-previous.jpg` | Default photo for a place created without one; faint background of the login/register pages | https://images.unsplash.com/photo-1506905925346-21bda4d32df4 |
| `default-trip-previous.jpg` | Default photo for a trip created without one | https://images.unsplash.com/photo-1469854523086-cc02fe5d8800 |

The old default photo for **trails** (`photo-1551632811-561732b1c4e9`) no longer exists on Unsplash
(it answers 404), so there is nothing to archive: trails created without a photo had a broken image.

To bring one of them back, put its file in `public/brand/archive/` back into use, for example by
setting `HERO_IMAGE` in `components/home/hero.tsx` to `"/brand/archive/home-hero-previous.jpg"`.
