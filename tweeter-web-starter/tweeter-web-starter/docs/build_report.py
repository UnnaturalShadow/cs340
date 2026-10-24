"""Generate the submission PDF from the report source and vector UML diagrams.

Run from the repository root: python3 docs/build_report.py
Requires reportlab. Render with pdftoppm or PyMuPDF for visual verification.
"""
from pathlib import Path
from math import atan2, cos, sin, pi
from html import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/milestone-2-report.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
SOURCE = (ROOT / 'docs/milestone-2-report.md').read_text()
c = canvas.Canvas(str(OUT), pagesize=(612, 792))
c.setTitle('Milestone 2 Part C - MVP and Template Method')
c.setAuthor('Tweeter project')
INK = HexColor('#183047')
BLUE = HexColor('#226487')
PALE = HexColor('#edf4f8')
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
    c.setFillColor(BLUE)
    c.rect(0, 780, 612, 12, fill=1, stroke=0)
    text(42, 750, 'TWEETER / MILESTONE 2 PART C', 9, True)
    text(42, 719, title, 20, True)
    text(42, 699, subtitle, 10)
    c.setStrokeColor(HexColor('#ccd9e2'))
    c.line(42, 685, 570, 685)
    text(42, 25, 'MVP and Template Method | Based on the current project source', 8)
    text(555, 25, str(number), 8)


def box(x, y, w, title, lines, stereotype=None, size=8):
    header = 36 if stereotype else 24
    h = header + len(lines) * 13 + 9
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.rect(x, y-h, w, h, fill=1, stroke=1)
    c.setFillColor(PALE)
    c.rect(x, y-header, w, header, fill=1, stroke=0)
    c.line(x, y-header, x+w, y-header)
    if stereotype:
        text(x+7, y-12, '<<' + stereotype + '>>', 7)
    text(x+7, y-header+8, title, size, True)
    for i, line in enumerate(lines):
        text(x+7, y-header-15-i*13, line, size)
    return (x, y, w, h)


def arrow(points, label=None, dashed=False, hollow=False, label_pos=None):
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
    if hollow:
        path.close()
        c.setFillColor(white)
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


page(1, 'Question 1: Story and MVP', '1. Roles, relationships, and layered dependencies')
q1 = paragraphs(section_between('### 1. Roles, relationships, and the dependency rule', '### 2. Why MVP'))
y = 669
for p in q1[:4]:
    y = para(p, y)
text(42, y-5, 'Figure 1. Story class and component relationships', 11, True)
top = y-23
box(42, top, 245, 'Story + ItemScroller<Status>', ['- items: Status[]; hasMoreItems: boolean', '+ presenterFactory(view): StoryPresenter', '+ effect: reset(...); cleanup: cancel()', '+ next: loadMoreItems(token, user)'], 'React view')
box(329, top, 241, 'PagedPresenterView<Status>', ['+ setItems(items: Status[]): void', '+ setHasMoreItems(value: boolean): void', '+ displayError(message: string): void'], 'interface; extends MessageView')
arrow([(287, top-47), (329, top-47)], dashed=True, hollow=True)
middle = top-130
box(42, middle, 245, 'StoryPresenter', ['# getMoreItems(token, user): Promise', '# getItemDescription(): string'], 'presenter')
box(329, middle, 241, 'PagedStatusItemPresenter', ['# createService(): StatusService'], 'abstract')
arrow([(287, middle-36), (329, middle-36)], hollow=True)
bottom = middle-88
box(329, bottom, 241, 'PagedPresenter<T, U>', ['# view: PagedPresenterView<T> (inherited)', '+ loadMoreItems(token, user): Promise', '# getMoreItems(...): Promise (abstract)'], 'abstract')
arrow([(449, middle-58), (449, bottom)], hollow=True)
box(42, bottom, 245, 'StatusService + shared domain', ['+ getStory(token, user, last, size): Promise', 'Status, User, AuthToken; FakeData', 'No imports from view or presenter'], 'model')
arrow([(164, middle-71), (164, bottom)], label='uses getStory()', dashed=True, label_pos=(170, bottom+7))
arrow([(164, top-97), (164, middle)], label='creates / calls', label_pos=(170, middle+8))
arrow([(570, bottom-35), (587, bottom-35), (587, top-70), (570, top-70)], dashed=True)
text(42, 52, 'Hollow triangles: inheritance / interface realization. Dashed open arrows: dependencies.', 8)
c.showPage()

page(2, 'Question 1: Story interaction', '2. Why MVP is effective, with a successful asynchronous page request')
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
    c.line(x, top-28, x, 108)
    c.setDash()


def message(a, b, yy, label, response=False, label_x=None):
    arrow([(xs[a], yy), (xs[b], yy)], dashed=response,
          label=label, label_pos=(label_x if label_x is not None else min(xs[a], xs[b])+4, yy+6))


yy = top-62
message(0, 1, yy, 'reset(token, displayedUser)')
message(1, 0, yy-34, 'setItems([]); setHasMoreItems(true)')
arrow([(245, yy-63), (280, yy-63), (280, yy-88), (245, yy-88)])
text(288, yy-78, 'loadMoreItems() -> getMoreItems()', 7)
message(1, 2, yy-116, 'getStory(token, user, null, 10)')
arrow([(407, yy-140), (442, yy-140), (442, yy-163), (407, yy-163)])
text(302, yy-155, 'getFeed(...)', 7)
message(2, 3, yy-190, 'getPageOfStatuses(null, 10)', label_x=407)
message(3, 2, yy-221, '[statuses, more]', True)
message(2, 1, yy-252, 'Promise resolves [statuses, more]', True)
message(1, 0, yy-285, 'setItems(statuses); setHasMoreItems(more)')
para('The presenter awaits the service Promise. Solid arrows are calls; dashed arrows are returned results. '
     'loadMoreItems and getMoreItems execute on the same StoryPresenter object through inherited methods. '
     'React re-renders the rows using StatusItem. Later scroll requests reuse the updated cursor.', 91, size=9)
c.showPage()

page(3, 'Question 2: Template Method', 'A. Roles and collaboration / B. Reduction of duplication')
y = 667
text(42, y, 'A. The superclass fixes the algorithm; subclasses select the data', 12, True)
y -= 17
for p in paragraphs(section_between('### A. Roles and collaboration', '### B. How duplication')):
    y = para(p, y)
text(42, y-8, 'B. One implementation of the common paging steps', 12, True)
y -= 26
for p in paragraphs(section_between('### B. How duplication is reduced', '## Source map')):
    y = para(p, y)
text(42, y-8, 'Source map', 12, True)
y -= 25
for p in section_between('## Source map', '## Assignment references').splitlines():
    if not p.strip():
        continue
    y = para(p.replace('- ', '', 1), y, size=9)
text(42, y-8, 'Scope of the diagrams', 12, True)
y = para('Only members needed for the pattern discussion are shown. Presenter stores the typed view; '
         'ErrorReportingPresenter supplies the reusable failure wrapper. Figure 4 abbreviates these inherited '
         'details so the template and its protected hooks remain visible.', y-24, size=9)
c.showPage()

page(4, 'Question 2: Before and after', 'Conceptual duplicated loaders and the implemented template-method hierarchy')
text(42, 660, 'Figure 3. Before extraction (conceptual reconstruction)', 11, True)
common = ['- items: Status[]; last: Status | null', '- more, loading: boolean; generation: number', '- service: StatusService; pageSize = 10', '+ reset(...); cancel()', '+ loadMoreItems(token, user)', '  guards, request, append, cursor, view, cleanup']
box(42, 641, 252, 'StoryPresenter', common + ['  request: service.getStory(...)'])
box(318, 641, 252, 'FeedPresenter', common + ['  request: service.getFeed(...)'])
para('The duplicated state and loading steps illustrate the extraction. They are not a historical snapshot; '
     'the earlier repository design already shared these steps through callback-based ScrollerPresenter.', 508, size=9)
text(42, 450, 'Figure 4. After extraction (current source)', 11, True)
box(143, 431, 326, 'PagedPresenter<T, U>', ['- items: T[]; last: T | null; more, loading: boolean', '- generation: number; _service?: U', '# pageSize = 10; # lastItem: T | null', '+ loadMoreItems(token, user) [template]', '# getMoreItems(token, user): Promise [abstract]', '# getItemDescription(): string [abstract]', '# createService(): U [abstract]'], 'abstract')
box(170, 252, 272, 'PagedStatusItemPresenter', ['# createService(): StatusService'], 'abstract; T = Status, U = StatusService')
arrow([(306, 252), (306, 295)], hollow=True)
box(42, 137, 252, 'StoryPresenter', ['# getMoreItems(...) -> service.getStory(...)', '# getItemDescription() -> "story"'])
box(318, 137, 252, 'FeedPresenter', ['# getMoreItems(...) -> service.getFeed(...)', '# getItemDescription() -> "feed"'])
arrow([(168, 137), (168, 159), (247, 159), (247, 194)], hollow=True)
arrow([(444, 137), (444, 159), (365, 159), (365, 194)], hollow=True)
text(42, 49, 'Hollow triangles point to the superclass. Protected (#) hooks vary the fixed template (+).', 8)
c.save()
print(OUT)
