# MEDINET-HABU — Bunyan Digital Museum

An Arabic-first bilingual digital museum and interactive architectural exploration of Medinet Habu, the mortuary temple of Ramesses III, and the wider archaeological precinct in Western Thebes, Luxor.

## Open the website

When GitHub Pages is enabled for `main` / `/(root)`, the expected public address is:

https://bunyaneg.github.io/MEDINET-HABU/

If Pages has not yet been enabled, open **Settings → Pages → Build and deployment → Deploy from a branch**, then choose `main` and `/(root)`.

## Run locally

This is a static website with no build step. Because Three.js is loaded as an ES module, serve the folder through a local web server rather than opening `index.html` directly as a `file://` URL.

For example, from the project folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in a modern browser.

## 3D experience

- Built with Three.js **0.187.0** and the matching `OrbitControls` addon, pinned to the same jsDelivr CDN release.
- Six interactive scenes: the overall precinct, the High Gate, the column hall, the royal palace and appearance window, the Small Temple of Amun, and a symbolic raised-relief study.
- Drag to orbit, scroll or pinch to zoom, pan to reposition, and click scene objects to read their notes. The palace scene includes a schematic audience hall, throne zone, private rooms, and appearance balcony; the Small Temple scene visualizes a columned court, peristyle hall, six chapels, and sanctuary.
- Optional auto-rotation, reset view, and fullscreen mode.
- Arabic and English interface, plus browser speech synthesis for the selected 3D object's explanation.
- The models are interpretive educational massing studies, not surveyed drawings, measured reconstructions, or definitive reconstructions of lost architecture.
- The 3D renderer needs an internet connection to load the Three.js modules. The encyclopedia content remains available if the CDN or WebGL is unavailable.

## Research content

The site covers:
- The history of the precinct before, during, and after Ramesses III.
- The architectural sequence from the eastern High Gate through the pylons, courts, column halls, chapels, and sanctuary.
- The palace, appearance window, magazines, workshops, stables, canal, and landing place.
- The Year 5, Year 8, and Year 11 military records and a cautious reading of the Sea Peoples' names.
- Amun worship, mortuary cult, offering calendars, festivals, and royal imagery.
- The Small Temple of Amun, God's Wives of Amun, later reuse, and the Christian settlement of Djeme.
- Excavation, epigraphic recording, conservation, key terms, and source criticism.

## Core references

- [Egyptian Ministry of Tourism and Antiquities — Medinet Habu (Arabic)](https://egymonuments.gov.eg/ar/monuments/the-temple-of-medinet-habu/)
- [Egyptian Ministry of Tourism and Antiquities — Medinet Habu (English)](https://egymonuments.gov.eg/monuments/the-temple-of-medinet-habu/)
- [University of Chicago — United with Eternity: A Concise Guide to the Monuments of Medinet Habu](https://isac.uchicago.edu/publications/united-eternity-concise-guide-monuments-medinet-habu)
- [Uvo Hölscher — Excavation of Medinet Habu, Volume I: General Plans and Views](https://isac.uchicago.edu/publications/excavation-medinet-habu-volume-1-plans-and-views)
- [Uvo Hölscher — The Mortuary Temple of Ramses III, Part I](https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oip54.pdf)
- [The Epigraphic Survey — Medinet Habu, Volume I: Earlier Historical Records of Ramses III](https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oip8.pdf)
- [The Epigraphic Survey — Medinet Habu, Volume II: Later Historical Records of Ramses III](https://isac.uchicago.edu/publications/medinet-habu-volume-ii-later-historical-records)
- [The Epigraphic Survey — Medinet Habu, Volume III: Calendar and Minor Records](https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oip23.pdf)
- [American Research Center in Egypt — Small Temple of Amun](https://archives.arce.org/collections/small-temple-of-amun)
- [Museo Egizio — Turin Strike Papyrus](https://collezionepapiri.museoegizio.it/en-GB/document/131)

## Image credits

Photographs are linked to their Wikimedia Commons file or category pages where possible. Check the individual file's author and license before reusing an image outside this site. The hero photograph links to [Thebes, Medinet Habu, Egypt, Temple of Ramesses III](https://commons.wikimedia.org/wiki/File:Thebes,_Medinet_Habu,_Egypt,_Temple_of_Ramesses_III.jpg), by Vyacheslav Argenberg, CC BY 4.0.

## Methodological note

Royal reliefs are treated as primary sources with a royal and religious purpose, not as neutral photographs of events. Disputed identifications and reconstructions are described cautiously. The architectural models are explanatory visualizations; use published archaeological plans and epigraphic editions for specialist work.
