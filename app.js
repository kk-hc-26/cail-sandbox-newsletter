/* ==========================================================================
   CAIL Weekly Updates — Newsletter Builder
   Renders the same table-based, inline-CSS HTML as newsletter.html.
   No build step, no dependencies. Open index.html in a browser.
   ========================================================================== */
'use strict';

const STORE_KEY = 'cail-newsletter-draft-v1';

/* ---------------------------------------------------------------- defaults */

const DEFAULTS = {
  meta: { issue: '001', date: '', preheader: '', intro: '' },
  updates: [{ tag: 'New', title: '', body: '', link: '' }],
  why: '',
  verification: '',
  tool: { name: '', tagline: '', body: '', code: '', cta: '', link: '', author: '' },
  research: [],
  events: [{ date: '', title: '', body: '', link: '' }],
  links: {
    lab_url: 'https://ailab.gc.cuny.edu',
    logo_url: 'https://ailab.gc.cuny.edu/images/logo-horizontal.png'
  }
};

const SAMPLE = {
  meta: {
    issue: '001',
    date: 'Sunday, November 22, 2026',
    preheader: 'Systems Mapping: fuller maps from second memos, faster hand-mapping, Auto-fit steps.',
    intro: 'This release is concentrated in Systems Mapping: second memos now return fuller maps, policy language is read more precisely, and hand-mapping takes fewer clicks. Release evidence and the tool spotlight follow.'
  },
  updates: [
    { tag: 'New', title: 'Second memos now return at least one macro node',
      body: 'Maps generated from a second memo include at least one macro node beside their exo nodes, so students begin from a structure rather than a list of leaves.', link: '' },
    { tag: 'Improved', title: 'Policy language is read more precisely',
      body: 'Systems Mapping counts a policy as operative only when it obliges or forbids. Acronyms are read as organizations, and anything that sits outside an office is placed at exo.', link: '' },
    { tag: 'Improved', title: 'Hand-mapping takes one double-click at every level',
      body: 'On the canvas, a double-click adds a node; on a node, it connects one. Clicks keep reaching the map until the student presses Cancel, so a sequence of placements no longer needs a mode switch.', link: '' },
    { tag: 'New', title: 'Immediate settings are drawn into the map',
      body: 'When a student chooses an immediate setting for a micro node in its panel, the map now draws a line to that setting instead of holding it as text only.', link: '' },
    { tag: 'Improved', title: 'Steps open in order, with a corner guide and Auto-fit',
      body: 'Steps now open in sequence beside a corner guide, and an Auto-fit switch returns the map to view without manual zooming.', link: '' }
  ],
  why: 'Systems Mapping now sits beside Stem Splitter on the Tools portal, sharing one CUNY Login, reporting, and class progress.',
  verification: '',
  tool: {
    name: 'Systems Mapping',
    tagline: 'Concept mapping for policy and systems coursework, now on the Tools portal.',
    body: 'Systems Mapping is a concept-mapping workspace for policy and systems coursework. Students build maps by hand or generate them from second memos, and instructors see maps, reports, and class progress in the same place as their other tools. This release widens generated maps, tightens how policy language is read, and reduces hand-mapping to a double-click.',
    code: '',
    cta: '',
    link: 'https://ailab.gc.cuny.edu/tools/',
    author: 'Zach, via Codex'
  },
  research: [],
  events: [
    { date: 'Thu, Dec 3', title: 'Systems Mapping workshop for instructors',
      body: 'A 45-minute walkthrough of second-memo maps, hand-mapping, and class progress reporting.', link: '#' },
    { date: 'Wed, Dec 9', title: 'Open session: mapping a memo start to finish',
      body: 'Drop-in working session for students and teaching staff. Bring a memo or a map in progress.', link: '#' }
  ],
  links: {
    lab_url: 'https://ailab.gc.cuny.edu',
    logo_url: 'https://ailab.gc.cuny.edu/images/logo-horizontal.png'
  }
};

const TAGS = ['New', 'Improved', 'Fixed', 'Breaking', 'Docs'];

const BADGE = {
  New:      { fg: '#067647', bg: '#ecfdf3', bd: '#abefc6' },
  Improved: { fg: '#175cd3', bg: '#eff8ff', bd: '#b2ddff' },
  Fixed:    { fg: '#b54708', bg: '#fffaeb', bd: '#fedf89' },
  Breaking: { fg: '#b42318', bg: '#fef3f2', bd: '#fecdca' },
  Docs:     { fg: '#5925dc', bg: '#f4f3ff', bd: '#d9d6fe' }
};

/* ---------------------------------------------------------------- helpers */

const clone = o => JSON.parse(JSON.stringify(o));
const has = v => String(v == null ? '' : v).trim().length > 0;

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Light inline formatting, applied to already-escaped text. */
function rich(v) {
  let t = esc(v);
  t = t.replace(/`([^`]+?)`/g,
    '<code style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,\'Courier New\',monospace; font-size:13px; background-color:#f2f4f7; border-radius:4px; padding:1px 4px; color:#344054;">$1</code>');
  t = t.replace(/\*\*([^*]+?)\*\*/g, '<strong style="color:#101828;">$1</strong>');
  t = t.replace(/(^|[\s(\u2014\u2013])_([^_]+?)_(?=[\s).,!?;:\u2014\u2013]|$)/g, '$1<em>$2</em>');
  t = t.replace(/\[([^\]]+?)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" style="color:#0b3d91; font-weight:600; text-decoration:underline;">$1</a>');
  return t;
}

/** Normalise a user-supplied href. Returns '' when unusable (flagged in checks). */
function href(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s) return '';
  if (s === '#') return '#';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(s)) return s;
  if (/^www\./i.test(s)) return 'https://' + s;
  return '';
}

const codeSuppressed = v => /^none$/i.test(String(v == null ? '' : v).trim());

function sections(d) {
  return {
    updates: (d.updates || []).filter(u => has(u.title) || has(u.body)),
    research: (d.research || []).filter(r => has(r.name) || has(r.body)),
    events: (d.events || []).filter(e => has(e.date) || has(e.title) || has(e.body)),
    toolOn: has(d.tool.name) || has(d.tool.body),
    codeOn: has(d.tool.code) && !codeSuppressed(d.tool.code)
  };
}

/* -------------------------------------------------------------- generator */

function generate(d) {
  const S = sections(d);
  const issue = has(d.meta.issue) ? esc(d.meta.issue.trim()) : '000';
  const date = rich(d.meta.date);
  const pre = has(d.meta.preheader) ? esc(d.meta.preheader.trim())
    : esc(String(d.meta.intro || '').trim()).slice(0, 90);

  const toc = [];
  if (S.updates.length) toc.push('Platform updates');
  if (S.toolOn) toc.push('Tool spotlight' + (has(d.tool.name) ? ': ' + esc(d.tool.name.trim()) : ''));
  if (S.research.length) toc.push('Research and projects');
  if (S.events.length) toc.push('Events and workshops');

  const tocLines = [];
  for (let i = 0; i < toc.length; i += 2) {
    tocLines.push(toc.slice(i, i + 2).map((t, j) => (i + j + 1) + '. ' + t).join(' &nbsp;\u00b7&nbsp; '));
  }

  const out = [];
  const P = s => out.push(s);

  P(`<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>CAIL Weekly Updates \u2014 Issue ${issue}</title>
<!--
  Generated by the CAIL newsletter builder (index.html).
  Template: newsletter.html \u00b7 Sample reference: sample-issue-01.html
  All styling is inline; the <style> block only holds mobile tweaks and a
  dark-mode guard. Layout is table-based for Outlook \u2014 do not convert to
  flex/grid. Send newsletter.txt alongside this as multipart/alternative.
-->
<style>
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  table { border-collapse:collapse !important; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { text-decoration:none; }
  @media only screen and (max-width:620px) {
    .container { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:24px !important; line-height:31px !important; }
    .h2 { font-size:18px !important; }
    .hide-sm { display:none !important; }
    .code { font-size:13px !important; }
  }
  @media (prefers-color-scheme: dark) {
    .dm-bg { background:#111827 !important; }
    .dm-card { background:#1f2937 !important; }
    .dm-text { color:#e5e7eb !important; }
    .dm-muted { color:#9ca3af !important; }
  }
</style>
</head>
<body class="dm-bg" style="margin:0; padding:0; background-color:#eef1f7; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

<!-- ============ PREHEADER (inbox preview text) ============ -->
<div style="display:none; font-size:1px; color:#eef1f7; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
  ${pre}
  &#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;&#8203;&#847;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="dm-bg" style="background-color:#eef1f7;">
  <tr>
    <td align="center" style="padding:26px 12px;">

      <!-- ==================== CARD ==================== -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container dm-card" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(16,24,40,0.08);">

        <!-- ---------- LOGO ---------- -->
        <tr>
          <td class="px" align="left" bgcolor="#ffffff" style="background-color:#ffffff; padding:24px 34px 20px 34px;">
            <a href="${esc(href(d.links.lab_url))}" style="text-decoration:none; border:0;">
              <img src="${esc(d.links.logo_url)}" width="176" height="40" alt="CUNY AI Lab"
                   style="display:block; width:176px; max-width:176px; height:auto; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
            </a>
          </td>
        </tr>

        <!-- ---------- HEADER ---------- -->
        <tr>
          <td bgcolor="#0b3d91" style="background-color:#0b3d91; background-image:linear-gradient(135deg,#0b3d91 0%,#124f9e 100%); padding:26px 34px 24px 34px;" class="px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:12px; letter-spacing:1.2px; text-transform:uppercase; color:#bcd2ee; padding-bottom:8px;">
                  <font color="#bcd2ee">CUNY AI Sandbox</font>
                </td>
              </tr>
              <tr>
                <td align="left" class="h1" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:28px; line-height:35px; font-weight:700; color:#ffffff; letter-spacing:-0.2px;">
                  <font color="#ffffff">CAIL Weekly Updates</font>
                </td>
              </tr>
              <tr>
                <td align="left" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:14px; line-height:21px; color:#dbe6f5; padding-top:6px;">
                  <font color="#dbe6f5">${date}</font>
                </td>
              </tr>
            </table>
          </td>
        </tr>`);

  if (has(d.meta.intro)) {
    P(`
        <!-- ---------- INTRO ---------- -->
        <tr>
          <td class="px" style="padding:28px 34px 4px 34px;">
            <p class="dm-text" style="margin:0; font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:16px; line-height:27px; color:#344054;">
              ${rich(d.meta.intro)}
            </p>
          </td>
        </tr>`);
  }

  if (tocLines.length) {
    P(`
        <!-- ---------- IN THIS ISSUE ---------- -->
        <tr>
          <td class="px" style="padding:20px 34px 0 34px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f9fc; border-left:3px solid #0b3d91; border-radius:4px;">
              <tr>
                <td style="padding:14px 18px; font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:14px; line-height:24px; color:#475467;">
                  <span style="font-weight:700; color:#0b3d91; letter-spacing:0.4px; text-transform:uppercase; font-size:11px;">In this issue</span><br>
                  ${tocLines.join('<br>\n                  ')}
                </td>
              </tr>
            </table>
          </td>
        </tr>`);
  }

  /* ---- platform updates ---- */
  if (S.updates.length) {
    P(`
        <!-- ==================== SECTION 1: PLATFORM UPDATES ==================== -->
        <tr>
          <td class="px" style="padding:34px 34px 0 34px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="h2" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:20px; line-height:28px; font-weight:700; color:#101828; padding-bottom:14px;">
                  Platform Updates
                </td>
              </tr>
            </table>
          </td>
        </tr>`);

    S.updates.forEach(u => {
      const tag = has(u.tag) ? u.tag.trim() : 'New';
      const c = BADGE[tag] || BADGE.New;
      const link = href(u.link);
      P(`
        <!-- ---------- UPDATE ITEM (REPEATABLE) ---------- -->
        <tr>
          <td class="px" style="padding:0 34px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eaecf0;">
              <tr>
                <td style="padding:16px 0 16px 0;">
                  <span style="display:inline-block; font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; color:${c.fg}; background-color:${c.bg}; border:1px solid ${c.bd}; border-radius:20px; padding:4px 10px;">${esc(tag)}</span>
                  <div class="dm-text" style="font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:16px; line-height:24px; font-weight:700; color:#101828; padding:10px 0 4px 0;">
                    ${rich(u.title)}
                  </div>
                  <div class="dm-text" style="font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:15px; line-height:25px; color:#475467;">
                    ${rich(u.body)}${link ? `\n                    <a href="${esc(link)}" style="color:#0b3d91; font-weight:600; text-decoration:underline;">Read more \u2192</a>` : ''}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- ---------- /UPDATE ITEM ---------- -->`);
    });

    if (has(d.why)) {
      P(`
        <!-- ---------- WHY IT MATTERS (optional) ---------- -->
        <tr>
          <td class="px" style="padding:14px 34px 0 34px;">
            <p class="dm-text" style="margin:0; font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:15px; line-height:25px; color:#475467;">
              <strong style="color:#101828;">Why this matters:</strong> ${rich(d.why)}
            </p>
          </td>
        </tr>`);
    }

    if (has(d.verification)) {
      P(`
        <!-- ---------- RELEASE VERIFICATION (optional) ---------- -->
        <tr>
          <td class="px" style="padding:10px 34px 0 34px;">
            <p style="margin:0; font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:11px; line-height:18px; color:#98a2b3;">
              Release verification: ${rich(d.verification)}
            </p>
          </td>
        </tr>`);
    }
  }

  /* ---- tool spotlight ---- */
  if (S.toolOn) {
    const tlink = href(d.tool.link);
    const cta = has(d.tool.cta) ? d.tool.cta : 'Access the tool';
    P(`
        <!-- ==================== SECTION 2: TOOL SPOTLIGHT ==================== -->
        <tr>
          <td class="px" style="padding:34px 34px 0 34px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
              <tr>
                <td style="padding:24px 24px 8px 24px;">
                  <div style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#0b3d91; padding-bottom:8px;">
                    Tool Spotlight
                  </div>
                  <div class="dm-text" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:21px; line-height:28px; font-weight:700; color:#101828; letter-spacing:-0.1px;">
                    ${rich(d.tool.name)}
                  </div>${has(d.tool.tagline) ? `
                  <div style="font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:15px; line-height:22px; color:#475467; font-style:italic; padding-top:5px;">
                    ${rich(d.tool.tagline)}
                  </div>` : ''}
                </td>
              </tr>${has(d.tool.body) ? `
              <tr>
                <td style="padding:8px 24px 0 24px;">
                  <p class="dm-text" style="margin:0; font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:15px; line-height:25px; color:#475467;">
                    ${rich(d.tool.body)}
                  </p>
                </td>
              </tr>` : ''}${S.codeOn ? `
              <!-- ---------- CODE SNIPPET ---------- -->
              <tr>
                <td style="padding:16px 24px 0 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111827" style="background-color:#111827; border-radius:8px;">
                    <tr>
                      <td class="code" style="padding:14px 16px; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace; font-size:13px; line-height:22px; color:#e5e7eb; white-space:pre; overflow-x:auto;"><font color="#e5e7eb">${esc(String(d.tool.code).replace(/\\s+$/, ''))}</font></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- ---------- /CODE SNIPPET ---------- -->` : ''}
              <tr>
                <td style="padding:18px 24px 24px 24px;">${tlink ? `
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" bgcolor="#0b3d91" style="background-color:#0b3d91; border-radius:8px;">
                        <a href="${esc(tlink)}" style="display:inline-block; padding:11px 20px; font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">
                          <font color="#ffffff">${esc(cta)}</font>
                        </a>
                      </td>
                    </tr>
                  </table>` : ''}${has(d.tool.author) ? `
                  <div style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:13px; line-height:19px; color:#556070; padding-top:${tlink ? '10' : '0'}px;">
                    Contributed by ${rich(d.tool.author)}
                  </div>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>`);
  }

  /* ---- research ---- */
  if (S.research.length) {
    P(`
        <!-- ==================== SECTION 3: RESEARCH AND PROJECTS ==================== -->
        <tr>
          <td class="px" style="padding:32px 34px 0 34px;">
            <div class="h2" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:20px; line-height:28px; font-weight:700; color:#101828; padding-bottom:6px;">
              Research and Projects in the Sandbox
            </div>
            <p class="dm-text" style="margin:0 0 14px 0; font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:14px; line-height:21px; color:#556070;">
              A selection of work currently running in the sandbox. To nominate a project for a future issue, reply to this email.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid #eaecf0;">`);

    S.research.forEach((r, i) => {
      const rlink = href(r.link);
      P(`
              <tr>
                <td style="padding:${i === 0 ? '2px' : '12px'} 0 2px 16px;">
                  <div class="dm-text" style="font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:15px; line-height:25px; color:#344054;">
                    <strong style="color:#101828;">${rich(r.name)}</strong>${has(r.body) ? ' \u2014 ' + rich(r.body) : ''}${rlink ? `
                    <a href="${esc(rlink)}" style="color:#0b3d91; font-weight:600; text-decoration:underline;">View project \u2192</a>` : ''}
                  </div>
                </td>
              </tr>`);
    });

    P(`
            </table>
          </td>
        </tr>`);
  }

  /* ---- events ---- */
  if (S.events.length) {
    P(`
        <!-- ==================== SECTION 4: EVENTS ==================== -->
        <tr>
          <td class="px" style="padding:32px 34px 0 34px;">
            <div class="h2" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:20px; line-height:28px; font-weight:700; color:#101828; padding-bottom:14px;">
              Events and Workshops
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">`);

    S.events.forEach(e => {
      const elink = href(e.link);
      P(`
              <!-- REPEATABLE EVENT ROW -->
              <tr>
                <td valign="top" width="86" style="font-family:'Trebuchet MS','Segoe UI',Tahoma,Verdana,sans-serif; font-size:13px; font-weight:700; color:#0b3d91; line-height:22px; padding:10px 0; border-top:1px solid #eaecf0;">
                  ${rich(e.date)}
                </td>
                <td valign="top" style="font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:15px; line-height:24px; color:#475467; padding:10px 0; border-top:1px solid #eaecf0;">
                  <strong style="color:#101828;">${rich(e.title)}</strong>${has(e.body) ? '<br>\n                  ' + rich(e.body) : ''}${elink ? `
                  <a href="${esc(elink)}" style="color:#0b3d91; font-weight:600; text-decoration:underline;">Add to calendar \u2192</a>` : ''}
                </td>
              </tr>
              <!-- /REPEATABLE EVENT ROW -->`);
    });

    P(`
            </table>
          </td>
        </tr>`);
  }

  /* ---- footer ---- */
  const labHref = href(d.links.lab_url);
  P(`
        <!-- ---------- FOOTER ---------- -->
        <tr>
          <td class="px" style="background-color:#f7f9fc; border-top:1px solid #eaecf0; padding:24px 34px 26px 34px;">
            <div style="font-family:Georgia,'Iowan Old Style','Times New Roman',Times,serif; font-size:13px; line-height:21px; color:#475467;">
              ${labHref ? `<a href="${esc(labHref)}" style="color:#0b3d91; font-weight:600; text-decoration:underline;">CUNY AI LAB</a>` : '<strong style="color:#344054;">CUNY AI LAB</strong>'}<br>
              You're receiving this because you have access to the sandbox.
            </div>
          </td>
        </tr>

      </table>
      <!-- ==================== /CARD ==================== -->

    </td>
  </tr>
</table>

</body>
</html>`);

  return out.join('')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '');
}

/* ------------------------------------------------------------- plain text */

function generateText(d) {
  const S = sections(d);
  const L = [];
  const issue = has(d.meta.issue) ? d.meta.issue.trim() : '000';

  L.push('CAIL WEEKLY UPDATES');
  L.push(`Issue ${issue} \u00b7 ${(d.meta.date || '').trim()}`);
  L.push('');
  if (has(d.meta.intro)) { L.push(d.meta.intro.trim()); L.push(''); }

  const toc = [];
  if (S.updates.length) toc.push('Platform updates');
  if (S.toolOn) toc.push('Tool spotlight' + (has(d.tool.name) ? ': ' + d.tool.name.trim() : ''));
  if (S.research.length) toc.push('Research and projects');
  if (S.events.length) toc.push('Events and workshops');
  if (toc.length) {
    L.push('---', 'IN THIS ISSUE');
    toc.forEach((t, i) => L.push(`${i + 1}. ${t}`));
    L.push('---', '');
  }

  if (S.updates.length) {
    L.push('PLATFORM UPDATES', '');
    S.updates.forEach(u => {
      L.push(`[${(u.tag || 'New').trim()}] ${(u.title || '').trim()}`);
      if (has(u.body)) L.push(u.body.trim());
      const l = href(u.link); if (l && l !== '#') L.push(l);
      L.push('');
    });
    if (has(d.why)) { L.push(`Why this matters: ${d.why.trim()}`, ''); }
    if (has(d.verification)) { L.push(`Release verification: ${d.verification.trim()}`, ''); }
  }

  if (S.toolOn) {
    L.push('---');
    L.push(`TOOL SPOTLIGHT: ${(d.tool.name || '').trim()}`.trim());
    if (has(d.tool.tagline)) L.push(d.tool.tagline.trim());
    L.push('');
    if (has(d.tool.body)) { L.push(d.tool.body.trim(), ''); }
    if (S.codeOn) { L.push(String(d.tool.code).trim(), ''); }
    const tl = href(d.tool.link);
    if (tl && tl !== '#') L.push(`Access the tool: ${tl}`);
    if (has(d.tool.author)) L.push(`Contributed by ${d.tool.author.trim()}`);
    L.push('');
  }

  if (S.research.length) {
    L.push('---', 'RESEARCH AND PROJECTS IN THE SANDBOX');
    S.research.forEach(r => {
      L.push(`${(r.name || '').trim()}${has(r.body) ? ' \u2014 ' + r.body.trim() : ''}`);
      const rl = href(r.link); if (rl && rl !== '#') L.push(rl);
    });
    L.push('To nominate a project for a future issue, reply to this email.', '');
  }

  if (S.events.length) {
    L.push('EVENTS AND WORKSHOPS');
    S.events.forEach(e => {
      L.push(`${(e.date || '').trim()}${has(e.title) ? ' \u2014 ' + e.title.trim() : ''}`);
      if (has(e.body)) L.push(e.body.trim());
      const el = href(e.link); if (el && el !== '#') L.push(el);
      L.push('');
    });
  }

  const lab = href(d.links.lab_url);
  L.push('---');
  L.push(lab && lab !== '#' ? `CUNY AI LAB: ${lab}` : 'CUNY AI LAB');
  L.push("You're receiving this because you have access to the sandbox.");

  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/* ------------------------------------------------------------------- state */

let state = loadDraft() || initial();
let view = 'desktop';

function initial() {
  const s = clone(DEFAULTS);
  s.meta.date = todayLabel();
  return s;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function mergeDeep(base, patch) {
  if (Array.isArray(patch)) return patch;
  if (patch && typeof patch === 'object') {
    const out = Object.assign({}, base);
    for (const k of Object.keys(patch)) out[k] = mergeDeep(base ? base[k] : undefined, patch[k]);
    return out;
  }
  return patch === undefined ? base : patch;
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? mergeDeep(clone(DEFAULTS), JSON.parse(raw)) : null;
  } catch (e) { return null; }
}

/* ------------------------------------------------------------------- lists */

const LIST_CONFIG = {
  updates: {
    label: 'Update',
    fields: [
      { k: 'tag', l: 'Tag', type: 'select', opts: TAGS },
      { k: 'title', l: 'Title', type: 'text', ph: 'Second memos now return at least one macro node' },
      { k: 'body', l: 'Body', type: 'textarea', ph: "What changed, and why it matters to the reader's work." },
      { k: 'link', l: 'Read-more link', type: 'text', ph: 'https://\u2026  (blank to drop the link)' }
    ]
  },
  research: {
    label: 'Project',
    fields: [
      { k: 'name', l: 'Person or project', type: 'text', ph: 'Ada Lovelace / Policy Atlas' },
      { k: 'body', l: 'What they are doing', type: 'textarea', ph: 'One sentence on their work in the sandbox.' },
      { k: 'link', l: 'Project link', type: 'text', ph: 'https://\u2026  (blank to drop)' }
    ]
  },
  events: {
    label: 'Event',
    fields: [
      { k: 'date', l: 'Date', type: 'text', ph: 'Thu, Dec 3' },
      { k: 'title', l: 'Title', type: 'text', ph: 'Systems Mapping workshop for instructors' },
      { k: 'body', l: 'Description', type: 'textarea', ph: 'One or two sentences.' },
      { k: 'link', l: 'Calendar / RSVP link', type: 'text', ph: 'https://\u2026  (blank to drop)' }
    ]
  }
};

function fieldHTML(list, i, f, value) {
  const id = `f-${list}-${i}-${f.k}`;
  const attrs = `id="${id}" data-list="${list}" data-index="${i}" data-field="${f.k}"`;
  if (f.type === 'select') {
    return `<div class="field" style="max-width:180px;">
      <label for="${id}">${f.l}</label>
      <select ${attrs}>${f.opts.map(o =>
        `<option value="${o}"${o === value ? ' selected' : ''}>${o}</option>`).join('')}</select>
    </div>`;
  }
  if (f.type === 'textarea') {
    return `<div class="field">
      <label for="${id}">${f.l}</label>
      <textarea ${attrs} rows="3" placeholder="${esc(f.ph || '')}">${esc(value)}</textarea>
    </div>`;
  }
  return `<div class="field">
    <label for="${id}">${f.l}</label>
    <input type="text" ${attrs} value="${esc(value)}" placeholder="${esc(f.ph || '')}">
  </div>`;
}

function renderList(list) {
  const wrap = document.getElementById(list + '-list');
  const cfg = LIST_CONFIG[list];
  const arr = state[list] || [];
  if (!arr.length) {
    wrap.innerHTML = `<div class="help" style="margin-bottom:10px;">No ${cfg.label.toLowerCase()} entries \u2014 this section is dropped from the email.</div>`;
    return;
  }
  wrap.innerHTML = arr.map((it, i) => `
    <div class="item" data-index="${i}">
      <div class="item-head">
        <span class="idx">${cfg.label} ${i + 1}</span>
        <span class="grow"></span>
        <button class="icon-btn" data-act="up" data-list="${list}" data-index="${i}" title="Move up" ${i === 0 ? 'disabled' : ''}>\u2191</button>
        <button class="icon-btn" data-act="down" data-list="${list}" data-index="${i}" title="Move down" ${i === arr.length - 1 ? 'disabled' : ''}>\u2193</button>
        <button class="icon-btn" data-act="dup" data-list="${list}" data-index="${i}" title="Duplicate">\u29c9</button>
        <button class="icon-btn del" data-act="del" data-list="${list}" data-index="${i}" title="Remove">\u2715</button>
      </div>
      <div class="grid">${cfg.fields.map(f => fieldHTML(list, i, f, it[f.k] || '')).join('')}</div>
    </div>`).join('');
}

function renderLists() {
  renderList('updates');
  renderList('research');
  renderList('events');
}

/* --------------------------------------------------------------- binding */

function setPath(path, value) {
  const parts = path.split('.');
  let o = state;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!o[parts[i]] || typeof o[parts[i]] !== 'object') o[parts[i]] = {};
    o = o[parts[i]];
  }
  o[parts[parts.length - 1]] = value;
}

function syncFormFromState() {
  document.querySelectorAll('[data-path]').forEach(el => {
    const parts = el.dataset.path.split('.');
    let v = state;
    for (const p of parts) v = v == null ? undefined : v[p];
    el.value = v == null ? '' : v;
  });
  renderLists();
  updateCounter();
}

/* --------------------------------------------------------------- preview */

let previewTimer = null;

function refresh() {
  updateCounter();
  updateChips();
  renderChecks();
  const html = generate(state);
  const frame = document.getElementById('preview');
  frame.srcdoc = html;
  document.getElementById('preview-meta').textContent =
    `Issue ${has(state.meta.issue) ? state.meta.issue.trim() : '000'} \u00b7 ${(html.length / 1024).toFixed(1)} KB`;
}

function queueRefresh() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(refresh, 120);
}

function updateCounter() {
  const el = document.getElementById('c-preheader');
  const n = String(state.meta.preheader || '').length;
  el.textContent = `${n} / 90`;
  el.classList.toggle('warn', n > 90);
}

function chip(el, on, text) {
  el.className = 'chip ' + (on ? 'on' : 'off');
  el.textContent = text;
}

function updateChips() {
  const S = sections(state);
  chip(document.getElementById('chip-updates'), S.updates.length > 0,
    S.updates.length ? `${S.updates.length} item${S.updates.length > 1 ? 's' : ''}` : 'dropped');
  chip(document.getElementById('chip-tool'), S.toolOn, S.toolOn ? 'included' : 'dropped');
  chip(document.getElementById('chip-research'), S.research.length > 0,
    S.research.length ? `${S.research.length} item${S.research.length > 1 ? 's' : ''}` : 'dropped');
  chip(document.getElementById('chip-events'), S.events.length > 0,
    S.events.length ? `${S.events.length} item${S.events.length > 1 ? 's' : ''}` : 'dropped');
}

/* ----------------------------------------------------------------- checks */

function renderChecks() {
  const S = sections(state);
  const rows = [];
  const ok = (msg) => rows.push(`<div class="check ok"><span class="dot"></span><span>${msg}</span></div>`);
  const warn = (msg, fix) => rows.push(
    `<div class="check warn"><span class="dot"></span><span>${msg}${fix ? ` <span class="fix">${fix}</span>` : ''}</span></div>`);

  const pre = String(state.meta.preheader || '').trim();
  if (!pre) warn('Preheader is empty.', 'The inbox preview line falls back to the intro.');
  else if (pre.length > 90) warn(`Preheader is ${pre.length} characters; the inbox truncates near 90.`);
  else ok(`Preheader is ${pre.length} characters.`);

  if (!has(state.meta.date)) warn('No date set for the header.');
  if (!has(state.meta.issue)) warn('No issue number set.');
  if (!has(state.meta.intro)) warn('No intro paragraph \u2014 the email opens straight into the section list.');

  if (!S.updates.length) warn('No platform updates. That is the main section of the email.');
  if (!S.toolOn) warn('No tool spotlight. The README calls for one tool or use case per issue.');

  /* link hygiene */
  const links = [];
  (state.updates || []).forEach((u, i) => { if (has(u.link)) links.push([`Update ${i + 1}`, u.link]); });
  (state.research || []).forEach((r, i) => { if (has(r.link)) links.push([`Project ${i + 1}`, r.link]); });
  (state.events || []).forEach((e, i) => { if (has(e.link)) links.push([`Event ${i + 1}`, e.link]); });
  if (has(state.tool.link)) links.push(['Tool CTA', state.tool.link]);
  if (has(state.links.lab_url)) links.push(['Lab URL', state.links.lab_url]);

  const broken = links.filter(([, v]) => !href(v));
  if (broken.length) {
    warn(`${broken.length} link${broken.length > 1 ? 's are' : ' is'} relative or malformed and will be dropped: ${broken.map(b => esc(b[0])).join(', ')}.`,
      'Use an absolute https:// URL.');
  } else if (links.length) {
    ok(`${links.length} link${links.length > 1 ? 's' : ''} are absolute.`);
  }

  const placeholders = links.filter(([, v]) => String(v).trim() === '#');
  if (placeholders.length) {
    warn(`${placeholders.length} link${placeholders.length > 1 ? 's are' : ' is'} a "#" placeholder: ${placeholders.map(p => esc(p[0])).join(', ')}.`,
      'Fill these before sending.');
  }

  /* copy rules */
  const allText = [
    state.meta.intro, state.why, state.tool.body, state.tool.tagline,
    ...(state.updates || []).map(u => u.body), ...(state.research || []).map(r => r.body),
    ...(state.events || []).map(e => e.body)
  ].join(' ');
  if (/!/.test(allText)) warn('An exclamation point appears in the copy.', 'House style is plain declarative sentences.');
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(allText)) warn('Emoji appear in the copy.', 'House style is no emoji.');
  if (/\b(recently|soon|shortly)\b/i.test(allText)) warn('Vague time words ("recently", "soon").', 'Prefer concrete numbers and dates.');

  if (!rows.some(r => r.includes('warn'))) {
    ok('Nothing blocking. Test in Gmail, Apple Mail, and Outlook before sending.');
  }

  document.getElementById('checks').innerHTML = rows.join('');
}

/* ------------------------------------------------------------------ toast */

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

let savedTimer = null;
function flashSaved() {
  const el = document.getElementById('save-state');
  el.textContent = 'Saved';
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { el.textContent = ''; }, 1400);
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); flashSaved(); }
    catch (e) { /* storage blocked — ignore */ }
  }, 500);
}

/* --------------------------------------------------------------- download */

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const issueSlug = () => {
  const n = has(state.meta.issue) ? state.meta.issue.trim().replace(/[^\w.-]+/g, '') : '000';
  return `cail-weekly-issue-${n}`;
};

/* ------------------------------------------------------------------ wiring */

function bind() {
  /* fixed fields */
  document.addEventListener('input', e => {
    const el = e.target;

    if (el.dataset.path) {
      setPath(el.dataset.path, el.value);
      scheduleSave();
      queueRefresh();
      return;
    }

    if (el.dataset.list && el.dataset.field) {
      const { list, index, field } = el.dataset;
      const arr = state[list];
      if (arr && arr[+index]) {
        arr[+index][field] = el.value;
        scheduleSave();
        queueRefresh();
      }
    }
  });

  document.addEventListener('change', e => {
    const el = e.target;
    if (el.tagName === 'SELECT' && el.dataset.list && el.dataset.field) {
      state[el.dataset.list][+el.dataset.index][el.dataset.field] = el.value;
      scheduleSave();
      queueRefresh();
    }
  });

  /* list actions */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (btn) {
      const list = btn.dataset.list;
      const i = +btn.dataset.index;
      const arr = state[list];
      const act = btn.dataset.act;

      if (act === 'del') {
        arr.splice(i, 1);
      } else if (act === 'dup') {
        arr.splice(i + 1, 0, clone(arr[i]));
      } else if (act === 'up' && i > 0) {
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      } else if (act === 'down' && i < arr.length - 1) {
        [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      }
      renderLists();
      scheduleSave();
      refresh();
      return;
    }

    const add = e.target.closest('[data-add]');
    if (add) {
      const list = add.dataset.add;
      const blank = {};
      LIST_CONFIG[list].fields.forEach(f => { blank[f.k] = f.type === 'select' ? f.opts[0] : ''; });
      state[list].push(blank);
      renderLists();
      scheduleSave();
      refresh();
      const items = document.querySelectorAll(`#${list}-list .item`);
      const last = items[items.length - 1];
      if (last) last.querySelector('input, textarea, select').focus();
      return;
    }
  });

  /* toolbar */
  document.getElementById('btn-today').addEventListener('click', () => {
    state.meta.date = todayLabel();
    document.getElementById('f-date').value = state.meta.date;
    scheduleSave();
    refresh();
  });

  document.getElementById('btn-sample').addEventListener('click', () => {
    if (!confirm('Replace the current form with the published sample issue?')) return;
    state = mergeDeep(clone(DEFAULTS), clone(SAMPLE));
    syncFormFromState();
    scheduleSave();
    refresh();
    toast('Sample issue loaded');
  });

  document.getElementById('btn-new').addEventListener('click', () => {
    if (!confirm('Start a blank issue? The current form will be cleared.')) return;
    const nextIssue = String((parseInt(state.meta.issue, 10) || 0) + 1).padStart(3, '0');
    state = initial();
    state.meta.issue = nextIssue;
    syncFormFromState();
    scheduleSave();
    refresh();
    toast('New issue started');
  });

  document.getElementById('btn-download').addEventListener('click', () => {
    download(issueSlug() + '.html', generate(state), 'text/html;charset=utf-8');
    toast('Downloaded HTML');
  });

  document.getElementById('btn-txt').addEventListener('click', () => {
    download(issueSlug() + '.txt', generateText(state), 'text/plain;charset=utf-8');
    toast('Downloaded plain text');
  });

  document.getElementById('btn-copy').addEventListener('click', async () => {
    const html = generate(state);
    try {
      await navigator.clipboard.writeText(html);
      toast('HTML copied to clipboard');
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = html;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('HTML copied to clipboard'); }
      catch (e2) { toast('Copy failed — use Download HTML'); }
      ta.remove();
    }
  });

  document.getElementById('btn-open').addEventListener('click', () => {
    const w = window.open('', '_blank');
    if (!w) return toast('Popup blocked');
    w.document.open();
    w.document.write(generate(state));
    w.document.close();
  });

  /* view toggle */
  document.getElementById('view-seg').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (!b) return;
    view = b.dataset.view;
    document.querySelectorAll('#view-seg button').forEach(x => x.classList.toggle('on', x === b));
    const frame = document.getElementById('preview');
    frame.style.maxWidth = view === 'mobile' ? '390px' : '';
    frame.style.width = view === 'mobile' ? '390px' : '100%';
  });

  /* draft io */
  document.getElementById('btn-export').addEventListener('click', () => {
    download(`cail-draft-${issueSlug()}.json`, JSON.stringify(state, null, 2), 'application/json');
    toast('Draft exported');
  });

  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('file-import').click();
  });

  document.getElementById('file-import').addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = mergeDeep(clone(DEFAULTS), JSON.parse(String(reader.result)));
        syncFormFromState();
        scheduleSave();
        refresh();
        toast('Draft imported');
      } catch (err) {
        toast('That file is not a valid draft');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Clear the saved draft in this browser and start blank?')) return;
    localStorage.removeItem(STORE_KEY);
    state = initial();
    syncFormFromState();
    refresh();
    toast('Draft cleared');
  });
}

/* -------------------------------------------------------------------- boot */

syncFormFromState();
bind();
refresh();
