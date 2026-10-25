"""Generate the submission PDF from the report source and vector UML diagrams.

Run from the repository root: python3 docs/build_report.py
Requires reportlab. Render with pdftoppm or PyMuPDF for visual verification.
"""
from pathlib import Path
from math import atan2, cos, sin, pi
from html import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/milestone-2-report.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
SOURCE = (ROOT / 'docs/milestone-2-report.md').read_text()
c = canvas.Canvas(str(OUT), pagesize=(612, 792))
c.setTitle('Milestone 2 Part C - MVP and Template Method')
c.setAuthor('Tweeter project')
INK = black
PALE = white
style = ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=14, textColor=INK)


def text(x, y, value, size=10, bold=False):
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.drawString(x, y, value)


def para(value, y, x=42, width=528, size=10):
    s = ParagraphStyle('p', parent=style, fontSize=size, leading=size * 1.4)
    p = Paragraph(escape(value), s)
    _, height = p.wrap(width, 720)
    p.drawOn(c, x, y - height)
    return y - height - 10


def page(number, title, subtitle):
    text(42, 719, title, 14, True)
    text(42, 699, subtitle, 10)
    text(555, 25, str(number), 8)


def box(x, y, w, title, lines, stereotype=None, size=8):
    header = 36 if stereotype else 24
    h = header + len(lines) * 13 + 9
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.rect(x, y-h, w, h, fill=1, stroke=0)
    c.setFillColor(PALE)
    c.rect(x, y-header, w, header, fill=1, stroke=0)
    c.setLineWidth(.8)
    c.rect(x, y-h, w, h, fill=0, stroke=1)
    c.line(x, y-header, x+w, y-header)
    if stereotype:
        text(x+7, y-12, '<<' + stereotype + '>>', 7)
    text(x+7, y-header+8, title, size, True)
    for i, line in enumerate(lines):
        text(x+7, y-header-15-i*13, line, size)
    return (x, y, w, h)


def arrow(points, label=None, dashed=False, hollow=False, label_pos=None, filled=False):
    c.setStrokeColor(INK)
    c.setLineWidth(.8)
    c.setDash(3, 2) if dashed else c.setDash()
    path = c.beginPath()
    path.moveTo(*points[0])
    for p in points[1:]:
        path.lineTo(*p)
    c.drawPath(path)
    c.setDash()
    x, y = points[-1]
    px, py = points[-2]
    angle = atan2(y-py, x-px)
    a = (x-8*cos(angle-.45), y-8*sin(angle-.45))
    b = (x-8*cos(angle+.45), y-8*sin(angle+.45))
    path = c.beginPath()
    path.moveTo(*a)
    path.lineTo(x, y)
    path.lineTo(*b)
    if hollow or filled:
        path.close()
        c.setFillColor(INK if filled else white)
        c.drawPath(path, fill=1)
    else:
        c.drawPath(path)
    if label:
        lx, ly = label_pos or ((px+x)/2+3, (py+y)/2+5)
        text(lx, ly, label, 7)


def section_between(start, end):
    return SOURCE.split(start, 1)[1].split(end, 1)[0].strip()


def paragraphs(block):
    return [p.strip().replace('\n', ' ') for p in block.split('\n\n') if p.strip()]


page(1, 'Question 1: Story and MVP', '1. The model, view, and presenter')
q1 = paragraphs(section_between('### 1. Roles, relationships, and the dependency rule', '### 2. Why MVP'))
y = 669
for p in q1[:4]:
    y = para(p, y)
text(42, y-5, 'Figure 1. Story class and component relationships', 11, True)
top = y-23
box(42, top, 145, 'Story', ['+ Story(): JSX.Element', 'renders ItemScroller<Status>'], 'React component', size=7.5)
box(207, top, 170, 'ItemScroller<T>', ['- items: T[]; hasMoreItems: boolean', '+ ItemScroller<T>(props): JSX.Element', 'calls reset / cancel / loadMoreItems', 'supplies the view-interface object'], 'React component', size=7.5)
box(397, top, 173, 'PagedPresenterView<Status>', ['+ setItems(items: Status[]): void', '+ setHasMoreItems(value: boolean): void', '+ displayError(message: string): void'], 'interface; extends MessageView', size=7.5)
arrow([(187, top-47), (207, top-47)], dashed=True)
arrow([(377, top-47), (397, top-47)], dashed=True)
middle = top-130
box(42, middle, 245, 'StoryPresenter', ['# getMoreItems(token, user): Promise', '# getItemDescription(): string'], 'presenter')
box(329, middle, 241, 'PagedStatusItemPresenter', ['# createService(): StatusService'], 'abstract')
arrow([(287, middle-36), (329, middle-36)], hollow=True)
bottom = middle-88
box(329, bottom, 241, 'PagedPresenter<T, U>', ['# view: PagedPresenterView<T> (inherited)', '+ loadMoreItems(token, user): Promise', '# getMoreItems(...): Promise (abstract)'], 'abstract')
arrow([(449, middle-58), (449, bottom)], hollow=True)
box(42, bottom, 245, 'StatusService + shared domain', ['+ getStory(token, user, last, size): Promise', 'Status, User, AuthToken; FakeData', 'No imports from view or presenter'], 'model')
arrow([(164, middle-71), (164, bottom)], label='uses getStory()', dashed=True, label_pos=(170, bottom+7))
arrow([(110, top-71), (110, middle)], label='creates', dashed=True, label_pos=(116, middle+16))
arrow([(272, top-97), (272, top-114), (225, top-114), (225, middle)], label='calls', dashed=True, label_pos=(280, top-111))
arrow([(570, bottom-35), (587, bottom-35), (587, top-70), (570, top-70)], dashed=True)
text(42, 52, 'Hollow triangles: inheritance / interface realization. Dashed open arrows: dependencies.', 8)
c.showPage()

page(2, 'Question 1: Story interaction', '2. Why MVP works well for my design')
q1b = [p.strip() for p in section_between('### 2. Why MVP is effective here', 'The PDF contains').splitlines() if p.strip()]
y = 669
for p in q1b:
    y = para(p, y)
text(42, y-5, 'Figure 2. First story page: sequence diagram', 11, True)
top = y-22
xs = [95, 245, 407, 540]
names = ['scroller: ItemScroller', 'presenter: StoryPresenter', 'service: StatusService', 'data: FakeData']
for x, name in zip(xs, names):
    c.setFillColor(PALE)
    c.setStrokeColor(INK)
    c.rect(x-59, top-28, 118, 28, fill=1)
    text(x-55, top-17, name, 7)
    c.setDash(3, 3)
    c.line(x, top-28, x, 97)
    c.setDash()


def message(a, b, yy, label, response=False, label_x=None):
    arrow([(xs[a], yy), (xs[b], yy)], dashed=response,
          label=label, label_pos=(label_x if label_x is not None else min(xs[a], xs[b])+4, yy+6),
          filled=not response)


yy = top-62
message(0, 1, yy, 'reset(token, displayedUser)')
message(1, 0, yy-28, 'setItems([])')
message(1, 0, yy-56, 'setHasMoreItems(true)')
arrow([(245, yy-82), (280, yy-82), (280, yy-100), (245, yy-100)], filled=True)
text(288, yy-94, 'loadMoreItems(token, user)', 7)
arrow([(245, yy-124), (280, yy-124), (280, yy-142), (245, yy-142)], filled=True)
text(288, yy-136, 'getMoreItems(token, user)', 7)
message(1, 2, yy-170, 'getStory(token, user, null, 10)')
arrow([(407, yy-195), (442, yy-195), (442, yy-213), (407, yy-213)], filled=True)
text(284, yy-207, 'getFeed(token, user, null, 10)', 7)
message(2, 3, yy-239, 'getPageOfStatuses(null, 10)', label_x=407)
message(3, 2, yy-268, '[statuses, more]', True)
message(2, 1, yy-297, 'awaited result: [statuses, more]', True)
message(1, 0, yy-326, 'setItems(statuses)')
message(1, 0, yy-354, 'setHasMoreItems(more)')
para('Solid arrows are ordinary calls, including methods that return Promises. The dashed service-to-presenter '
     'arrow summarizes the awaited result, not an immediate return. At await, the continuation pauses without '
     'blocking the browser. reset does not await loadMoreItems. Only a successful first page is shown; '
     'internal helpers and error/cancel paths are omitted.', 85, size=8.5)
c.showPage()

page(3, 'Question 2: Template Method', 'A. How the classes work together / B. How they share code')
y = 667
text(42, y, 'A. The superclass and subclasses', 12, True)
y -= 17
for p in paragraphs(section_between('### A. Roles and collaboration', '### B. How duplication')):
    y = para(p, y)
text(42, y-8, 'B. Reducing duplicate code', 12, True)
y -= 26
for p in paragraphs(section_between('### B. How duplication is reduced', '## Assignment references')):
    y = para(p, y)
c.showPage()

page(4, 'Question 2: Before and after', 'The design before Part B and the current design')
text(42, 660, 'Figure 3. Before', 11, True)
box(143, 641, 326, 'ScrollerPresenter<T>', ['- items, last, more, loading, generation: paging state', '- load: (...) => Promise; label: string', '+ loadMore(); reset(...); cancel()'], 'abstract')
box(42, 515, 252, 'StoryPresenter', ['+ constructor(view, service = new StatusService())', '  super(view, "story", service.getStory.bind(service))'], size=7.5)
box(318, 515, 252, 'FeedPresenter', ['+ constructor(view, service = new StatusService())', '  super(view, "feed", service.getFeed.bind(service))'], size=7.5)
arrow([(168, 515), (168, 536), (247, 536), (247, 557)], hollow=True)
arrow([(444, 515), (444, 536), (365, 536), (365, 557)], hollow=True)
para('The parent already handled paging. Each subclass created a StatusService and passed the parent '
     'a label and the service method to use.', 444, size=9)
text(42, 390, 'Figure 4. After', 11, True)
box(143, 371, 326, 'PagedPresenter<T, U>', ['- items: T[]; last: T | null; more, loading: boolean', '- generation: number; _service?: U', '# pageSize = 10; # lastItem: T | null', '+ loadMoreItems(token, user) [template]', '# getMoreItems(token, user): Promise [abstract]', '# getItemDescription(): string [abstract]', '# createService(): U [abstract]'], 'abstract')
box(170, 213, 272, 'PagedStatusItemPresenter', ['# createService(): StatusService'], 'abstract; T = Status, U = StatusService')
arrow([(306, 213), (306, 235)], hollow=True)
box(42, 115, 252, 'StoryPresenter', ['# getMoreItems(...) -> service.getStory(...)', '# getItemDescription() -> "story"'])
box(318, 115, 252, 'FeedPresenter', ['# getMoreItems(...) -> service.getFeed(...)', '# getItemDescription() -> "feed"'])
arrow([(168, 115), (168, 135), (247, 135), (247, 155)], hollow=True)
arrow([(444, 115), (444, 135), (365, 135), (365, 155)], hollow=True)
text(42, 43, 'Hollow triangles point to the superclass. Protected (#) hooks vary the fixed template (+).', 8)
c.save()
print(OUT)
