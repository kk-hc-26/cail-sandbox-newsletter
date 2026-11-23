# CUNY AI Sandbox — Weekly Newsletter Template

Two files, same content:

- `newsletter.html` — the email (table-based, inline CSS, ~600px card, mobile + dark-mode tweaks)
- `newsletter.txt` — plain-text fallback (send as `multipart/alternative` for better deliverability)
- `sample-issue-01.html` — a filled issue (Systems Mapping release) showing the finished result
- `content.md` — the fill-in sheet you edit each week

## Weekly fill-in checklist

1. **Search for `{{`** in both files and replace every token. Keep HTML and text in sync.
2. **Update items** — `newsletter.html` has 3 `<tr>` blocks marked `REPEATABLE` (badge colors already rotate green / blue / amber). Duplicate for more, delete for fewer.
3. **Tool spotlight** — one tool or use case per email, with a copy-paste snippet and a single call to action. Delete the code-snippet `<tr>` if the tool doesn't need one.
4. **Links must be absolute** (`https://...`); relative links break in most mail clients.
5. **Send a test** to Gmail, Apple Mail, and Outlook before the real send.

## Section order

| # | Section | Purpose |
|---|---------|---------|
| 1 | Platform Updates | New / Improved / Fixed / Breaking / Docs — what actually shipped |
| 2 | Tool Spotlight | One tool or use case, with a copy-paste snippet + CTA |
| 3 | Research and Projects | Work running in the sandbox; invite nominations |
| 4 | Events and Workshops | Workshops, demos, deadlines |
| — | CUNY AI Lab link + footer | Link to the lab site, archive, unsubscribe |

## Voice and style

- Plain, declarative sentences. No exclamation points, no emoji, no hype adjectives.
- State what changed and why it matters to the reader's work; leave the superlatives out.
- Active voice, second person sparingly. "We deployed" / "The sandbox now supports".
- Prefer concrete numbers and dates over "recently" and "soon".

## Pasting into a mail client

Copy-paste sanitises CSS. Gmail, Outlook, and Word keep `bgcolor` and `<font color>` attributes but drop most `style` declarations, which is why a dark header can paste as **black text on dark blue**.

That is why the header, the CTA button, and the code block carry **both** a CSS colour and a legacy attribute:

```html
<td bgcolor="#0b3d91" style="background-color:#0b3d91;">
  <font color="#ffffff">Weekly Update</font>
```

Keep both when editing. Never set the text colour only in `style` on a dark background — the background may survive the paste while the colour does not.

If a paste still loses the header colours, fix it in place: select the title, set the text colour to white, or set the cell fill to the CUNY blue. Pasting is the least reliable delivery path; sending the HTML as the actual message body (via a sending tool, or `multipart/alternative` with `newsletter.txt`) preserves everything.

## Editing rules

- All styling is **inline** — Gmail and Outlook strip `<style>` rules. The `<style>` block only holds mobile tweaks and a dark-mode guard.
- Layout is **table-based** on purpose. Don't convert to flex/grid.
- Font stack is system fonts; no web fonts (they don't load reliably).
- Badges use `display:inline-block` on a `<span>` — supported by Gmail, Apple Mail, and Outlook 365.
- Keep the preheader text (hidden div at the top) under ~90 characters; it's the inbox preview line.
- Prefer a live URL over a base64 image; add `alt` text and explicit `width`/`height` to any logo you add.

## Optional additions

- Logo in the header: add an `<img>` in the header `<td>` (use 2x asset, set width to half).
- Split testing subject lines: keep `{{date}}` out of the subject so A/B variants stay comparable.
- Archive page: mirror the HTML at `{{archive_url}}` before sending so the footer link works.
