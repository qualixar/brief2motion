"""extra.py: the two sections added for version 1.1.0, "Site mode" and "Motion patterns".

build.py calls site_mode_body(h) and patterns_body(h) with its helper functions in `h`. Everything that can be read from
the repository is read here: the stage table text is written by hand, but the numbers come from examples/larkspur/qa.json,
the page types from references/page-blueprints.md, and the pattern table from the pattern files themselves.
"""
import collections
import json
import re
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
SKILL = REPO / 'skills' / 'brief2motion'
LARK = REPO / 'examples' / 'larkspur'


def first_sentence(text):
    """The text up to the first full stop that is not inside backticks."""
    out, ticks = '', False
    for i, ch in enumerate(text):
        out += ch
        if ch == '`':
            ticks = not ticks
        if ch == '.' and not ticks and (i + 1 == len(text) or text[i + 1] == ' '):
            break
    return out.strip().rstrip('.')


def short_answer(text, floor=30):
    """The first sentence, and the second as well when the first is too short to stand alone ("Not created")."""
    first = first_sentence(text)
    rest = text[len(first):].lstrip('. ').strip()
    return first + '. ' + first_sentence(rest) if len(first) < floor and rest else first


def up(t):
    return t[:1].upper() + t[1:]


# ------------------------------------------------------------------------------------------------ site mode

def blueprint_rows():
    """(page type, section order, action) from references/page-blueprints.md."""
    text = (SKILL / 'references' / 'page-blueprints.md').read_text()
    rows = []
    for block in re.split(r'\n## ', text)[1:]:
        title = block.splitlines()[0]
        order = re.search(r'^Order: (.+?)\.?$', block, re.M)
        action = re.search(r'^Action: (.+)$', block, re.M)
        if order and action:
            name = re.sub(r'\s*\(.*\)', '', title).strip()
            rows.append([name, order.group(1).replace(' → ', ', then '), first_sentence(action.group(1))])
    return rows


def run_lines():
    """The `run node ...` lines of larkspur's check script, written as the commands a person would type."""
    out = []
    for line in (LARK / 'tools' / 'run-checks.sh').read_text().splitlines():
        m = re.match(r'^run node \$S/(\S+) (.*)$', line)
        if m:
            args = m.group(2).replace('"$@"', '').strip()
            out.append(f'node $S/{m.group(1)} {args}'.rstrip())
    return out


def qa_numbers():
    qa = json.loads((LARK / 'qa.json').read_text())
    by = collections.Counter(r['checker'] for r in qa['results'])
    pending = [r for r in qa['results'] if r['outcome'] == 'PENDING']
    rep = json.loads((LARK / 'site-report.json').read_text())
    claims = len(re.findall(r'^\| C\d+ ', (LARK / 'CONTENT.md').read_text(), re.M))
    return {
        'qa': qa, 'by': by, 'pending': pending, 'total': len(qa['results']), 'sum': qa['summary'],
        'routes': len(json.loads((LARK / 'routes.json').read_text())['routes']),
        'journeys': len(json.loads((LARK / 'journeys.json').read_text())['journeys']),
        'claims': claims, 'report': rep,
        'weights': [p['weightDesktop']['localBytes'] for p in rep['pages'].values()],
        'p95': max(p['desktop']['p95Ms'] for p in rep['pages'].values()),
        'p95phone': max(p['phone']['p95Ms'] for p in rep['pages'].values()),
        'cdn': sum(p['weightDesktop']['cdnBytes'] for p in rep['pages'].values()),
    }


def site_mode_body(h):
    n = qa_numbers()
    s = n['sum']
    kb = lambda b: f'{b / 1024:.0f}'   # noqa: E731
    w = n['weights']
    chrome = n['qa']['environment']['browser']
    axe = n['qa']['environment']['axe']

    when = h.p('Use site mode when the brief asks for a site with several pages, or for one page whose job is to get a visitor to sign up, buy, book or register. '
               'Stay with the six-step loop when the motion is the point of the page: a product to turn, a scroll story, a particle portrait.')

    stages = h.table(['Stage', 'What it settles', 'File it writes', 'Checked by'], [
        ['1. Discovery', 'who visits, what each of them wants to do, what the owner counts as success, the limits, and every open question with the assumption you took', '`DISCOVERY.md`', '`check_plan`'],
        ['2. Content', 'every word on every page; each claim has an ID and a source, or is marked DRAFTED', '`CONTENT.md`', '`check_plan`'],
        ['3. Routes', 'for each page: path, parent, template, title, description, main action, states, links', '`routes.json`, `SITEMAP.md`', '`check_plan`, `check_meta`'],
        ['4. Wireframes', 'grey boxes with the real copy, phone first, with the main action in reach', '`wireframes/<template>.html`', '`check_layout`'],
        ['5. Tokens', 'colours, type and spacing as named values, light and dark, with the text pairs to measure', '`tokens.json`, then `site/tokens.css`', '`build_tokens`'],
        ['6. Visual design', 'one idea taken from the subject; type, grid, colour, pictures; the one thing a visitor will remember. Then the router and `SPEC.md`, as in the loop', '`DESIGN.md`, `ASSETS.json`', '`check_plan`'],
        ['7. Motion', 'for each movement: its purpose, trigger, states, how it can be interrupted, its reduced-motion form and its pattern page', '`MOTION.md`', '`check_site`'],
        ['8. Build', 'semantic HTML first, motion on top', '`site/`', 'everything above'],
        ['9. Checks and a second reader', 'the tasks a visitor must finish, the checker records, and notes from someone who did not build it', '`journeys.json`, `check/qa.json`, `REVIEW.md`', 'five checkers'],
    ], ['15%', '45%', '22%', '18%'])

    rules = h.ul([
        '**Only the brief\'s facts.** No invented reviews, logos, customers or numbers. `check_plan` fails a drafted claim that looks like proof and sends a drafted figure to review.',
        '**Phone first.** Wireframes are drawn for 390 px first, and every journey runs on a phone as well as on a desktop.',
        '**States are declared.** A page with a form, a search or a fetched list lists its empty, loading, error and success states in `routes.json`, and each one is loaded by the checkers.',
    ])

    blueprints = h.table(['Page type', 'Sections, in the order the visitor\'s questions arrive', 'The one action'],
                         [[f'**{r[0]}**', up(r[1]), up(r[2])] for r in blueprint_rows()], ['15%', '55%', '30%'])

    compress = h.p(
        'A small brief does not need nine long documents. For a one-page site, keep one short entry in each file. '
        'You may skip stage 4 when the page has no template choice, and stage 7 when it has no motion. A site with several page types '
        'writes one entry per route or template.',
        'Never skip stages 1, 2, 3 and 9. Without them nothing says what the page is for, whether its words are true, '
        'where it sits, or whether it worked.')

    outcomes = h.table(['Outcome', 'Meaning', 'What you do'], [
        ['PASS', 'measured, and within its threshold', 'nothing'],
        ['FAIL', 'measured, and over the threshold; blocks the release', 'fix the page, run again'],
        ['REVIEW', 'the tool cannot decide: text over a picture, a drafted figure, an ambiguous overlap', 'look at it yourself and decide'],
        ['PENDING', 'no evidence exists yet: a site not built, a sign-up that ends at a fixture, axe-core not loaded offline', 'connect the missing piece and run again'],
    ], ['14%', '56%', '30%'])

    checks = h.table(['Check', 'It opens', 'What it catches'], [
        ['`check_plan`', 'the plan files, no browser', 'a task with no page to do it on; a claim with no source; an invented review or logo; a picture with no rights record; a page nothing links to; a form with no declared states'],
        ['`check_layout`', 'every page and state in Chrome at 320, 390, 768 and 1440 px', 'sideways scroll; text cut off; text and buttons colliding; tap targets under 24 px; lines far too long; a focused control hidden under a sticky bar'],
        ['`check_a11y`', 'every page and state, light and dark', 'failed axe-core rules (names, roles, labels, landmarks, contrast); the Tab key not reaching the page\'s main action'],
        ['`check_journeys`', 'a phone and a desktop window, driven by `journeys.json`', 'a visitor who cannot finish the task: click this link, fill this field, expect this message; any console error on the way'],
        ['`check_meta`', 'the built pages, no browser', 'a missing or repeated title or description; a wrong canonical address; a share image that is missing or too small; a sitemap that disagrees with `routes.json`'],
    ], ['18%', '28%', '54%'])

    second = h.p(
        'A checker measures. It cannot see that a layout is dull or that the first screen says nothing. So the last part of site mode is a second reader: '
        'a different agent or a person who did not build the page and has not read the brief. They get what a visitor gets, the built site and its screenshots, and write notes in `REVIEW.md`.',
        'They start with three questions, answered cold from the first screen at 390 px and again at 1440: what does this page offer, and to whom; what did your eye land on first; what would you do next. '
        'Then they read the brief. Wherever their answers differ from what the brief meant, that is a finding, even if every check passed.',
        'Three short tests follow. Switch to reduced motion and mute the tab: is the page still complete? Use it one-handed on a phone: can a thumb reach the main action? Shrink the first screen to 480 px wide: can you still say what it offers? '
        'Two rounds of fixes are enough. A third means the brief is unclear, and the question goes back to the owner.')

    by = n['by']
    per = h.table(['Check', 'Records in `qa.json`'], [
        ['`build_tokens`: colour pairs, light and dark', str(by['build_tokens'])],
        ['`check_plan`', str(by['check_plan'])],
        ['`check_layout`: every page, state and wireframe at four widths', str(by['check_layout'])],
        ['`check_a11y`', str(by['check_a11y'])],
        ['`check_journeys`', str(by['check_journeys'])],
        ['`check_meta`', str(by['check_meta'])],
        ['**All together**', f'**{n["total"]}**'],
    ], ['70%', '30%'])

    worked = (
        h.p(f'`examples/larkspur/` is a {n["routes"]}-page launch site for a shared inbox, built through the nine stages, all but the second reader\'s notes. Larkspur is a made-up product, and the site says so near the top and in the footer. '
            f'Its brief gives the facts it may state, two plans and a 14-day trial, and says there are no customers, logos, reviews or statistics. So the site has none. The brief\'s "done when" asks for a visitor on a phone to get from the home page to a finished trial form, including after one mistake.')
        + h.fig('larkspur-top.jpg', '`larkspur`, home page. One idea (the inbox drawn in code, marked as sample data), one action, and no invented proof.')
        + h.p(f'The stage files are the content of the folder: {n["routes"]} routes in `routes.json`, {n["claims"]} sourced claims in `CONTENT.md`, {n["journeys"]} journeys in `journeys.json`, and one script that runs everything.')
        + h.code('\n'.join(run_lines()))
        + h.p('The script is `examples/larkspur/tools/run-checks.sh`. It runs those commands in stage order, keeps `qa.json` and `site-report.json` beside the example, and exits 0 when nothing failed. '
              'Copy it into your own project and change the folder names. Add `--no-perf` on a machine with no graphics chip. Start it with:')
        + h.code('bash examples/larkspur/tools/run-checks.sh')
        + h.p(f'The result, read from `qa.json` when this guide is built: **{s["PASS"]} PASS, {s["FAIL"]} FAIL, {s["REVIEW"]} REVIEW, {s["PENDING"]} PENDING**, out of {n["total"]} records, in {chrome} with axe-core {axe}.')
        + per
        + h.p('The two PENDING records are one journey, "start the trial", on a phone and on a desktop. The form is a fixture: it checks the entry and shows a thank-you, and sends and stores nothing. '
              'The click-through passed, but nothing proves that a real service would receive the sign-up, so the report does not say PASS. Connect the service, run again, and they change.')
        + h.p(f'The motion checks on the same pages (`check_site`) passed {sum(c["pass"] for c in n["report"]["checks"])} of {len(n["report"]["checks"])}. Each page is {kb(min(w))} to {kb(max(w))} KB'
              + (', and nothing loads from another host. ' if n['cdn'] == 0 else f', with {n["cdn"]} bytes from another host. ')
              + (f'The slowest 95th-percentile frame is {n["p95"]} ms on desktop and {n["p95phone"]} ms on the emulated phone.' if n['p95'] != n['p95phone']
                 else f'The slowest 95th-percentile frame is {n["p95"]} ms, on desktop and on the emulated phone alike.'))
        + h.note('What a green report does not cover', 'Larkspur has no `REVIEW.md` from a second reader, no screen-reader pass and no back end. All three are named in its README. '
                 'A report with no FAIL says the measurable things hold. It does not say the page is good.'))

    return (h.lead('Some briefs ask for more than a page that moves. They ask for a site with several pages, or for one page that has to make a visitor do something. '
                   'For those, brief2motion works through nine stages. Each writes one short file that you and the agent can both read, and each has a check.')
            + h.h2('When to use it') + when
            + h.p('Site mode puts design before motion. Stages 1 to 5 come before the loop\'s first step. Stage 6 holds the routing and the spec. Stages 8 and 9 are the loop\'s build and check.')
            + h.h2('The nine stages') + stages + rules
            + h.h2('Page types') + h.p('Stage 2 and stage 4 start from the kind of page. `references/page-blueprints.md` gives the usual order of sections for seven kinds, with one action for each. '
                                       'Keep only the sections the visitor\'s decision needs.') + blueprints
            + h.h2('A one-page brief') + compress
            + h.h2('The five checks') + h.p('Five checkers write into one file, `check/qa.json`. Each record names the page, the state, the width, the browser, what was measured and the threshold. '
                                            'Beside them, `build_tokens` measures the colour pairs and `check_site` still runs the motion, fallback and weight checks.')
            + checks + h.h2('What PASS, FAIL, REVIEW and PENDING mean') + outcomes
            + h.p('Exit code 0 means no FAIL. Add `--strict` and a REVIEW fails too.')
            + h.h2('The second reader') + second
            + h.h2('Worked case: Larkspur') + worked)


# ------------------------------------------------------------------------------------------------ patterns

# One pattern page answers "Reduced motion" with a pointer to its own text ("through the listener path above"), which means
# nothing in a table. Its facts are in that page's paragraph about reduced motion; this is them in one line.
REDUCED_OVERRIDE = {'scroll-progress-bar': 'Kept, because it is information: the bar grows with the reader\'s own scroll, with no animation'}


def pattern_rows():
    """(name, stack, use when, reduced-motion form) read from every file in references/patterns/ except the README."""
    routing = json.loads((SKILL / 'references' / 'routing.json').read_text())
    rows = []
    for p in routing['patterns']:
        text = (SKILL / 'references' / p['ref']).read_text()
        use = re.search(r'^\*\*Use when:\*\*\s*(.+)$', text, re.M).group(1)
        red = re.search(r'^## Reduced motion[^\n]*\n+(.+?)(?:\n\n|\n##|\Z)', text, re.M | re.S).group(1).replace('\n', ' ')
        reduced = REDUCED_OVERRIDE.get(p['id']) or up(short_answer(red))
        rows.append([f'`{p["id"]}`', p['stack'].replace('view-transitions', 'View Transitions'), up(first_sentence(use)), reduced])
    return rows


def route_example():
    """Run route.mjs on a small brief and keep its Pattern lines, so the example is real output."""
    brief = ('# Brief: Nine Lakes\nThe hero should animate in on load, headline first. Three headline figures count up as they scroll into view. '
             'A marquee of brand names. Clicking a product card grows it into its page.\n')
    res = subprocess.run(['node', str(SKILL / 'scripts' / 'route.mjs'), '-'], input=brief, capture_output=True, text=True, check=True)
    lines = [re.sub(r': references/patterns/\S+, because ', ', because ', x) for x in res.stdout.splitlines() if x.startswith('Pattern:')]
    return brief.strip().split('\n', 1)[1], lines


def patterns_body(h):
    rows = pattern_rows()
    count = len(rows)
    files = [f for f in (SKILL / 'references' / 'patterns').glob('*.md') if f.name != 'README.md']
    assert count == len(files), 'routing.json and references/patterns/ disagree'
    said, lines = route_example()
    return (h.lead(f'A pattern is a recipe for one motion you can name: a headline that rises line by line, a number that counts up, a card that grows into its page. '
                   f'There are {count}, one page each in `references/patterns/`.')
            + h.p('Every page has the same parts. **Use when** and **Not when** say whether the pattern fits. **Stack** names the tool. **Brief words** are the phrases that point to it. '
                  '**Sketch** is a short piece of code written against the kit. **Budget** is the cost, **Reduced motion** is what a visitor with that setting sees, and **Checks** says what `check_site.mjs` measures and what you must look at by eye.',
                  'A sketch is something to copy and change, not a finished page. The tests check that each sketch\'s JavaScript parses and that every file it imports from the kit exists. The examples are the tested pages.')
            + h.h2('Four rules every pattern follows')
            + h.ol(['The content is in the HTML and readable without JavaScript.',
                    'Motion is created only when reduced motion is off.',
                    'The page ends its setup with `signal(\'ready\')`, `signal(\'reduced\')` or `signal(\'static\')`.',
                    'Nothing else moves than what the motion plan lists.'])
            + h.h2('How `route.mjs` suggests them')
            + h.p('Each pattern has phrases with weights in `references/routing.json`. The router adds up the weights of the phrases it finds in your brief. '
                  'A pattern with a total of 4 or more is suggested. At most four are shown, best first, each with the words that led there. '
                  'Their pages are added to the list the agent reads before building.',
                  'Take this brief text:')
            + h.code(said) + h.p('The router prints:') + h.code('\n'.join(lines))
            + h.p('A phrase it does not know, such as "drifts sideways", scores nothing, which is why the brief above says "marquee". The "Brief words" line on each page lists what it listens for. '
                  'To add a pattern, write its page with the same parts, list it in the index and in `patterns` in `routing.json` with its phrases, and run `node --test tests/*.test.mjs`.')
            + h.h2(f'All {count} patterns')
            + h.p('Generated from the pattern pages and `routing.json` when this guide is built. The last column is what a visitor with reduced motion sees.')
            + h.table(['Pattern', 'Stack', 'Use it when', 'With reduced motion'], rows, ['21%', '9%', '34%', '36%']))
