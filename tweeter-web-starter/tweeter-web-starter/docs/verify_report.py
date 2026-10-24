"""Render the report and fail if any text extends outside its page."""
from pathlib import Path
import pymupdf as fitz

root = Path(__file__).resolve().parents[1]
out = root / 'tmp/pdfs'
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(root / 'output/pdf/milestone-2-report.pdf')
assert len(doc) == 4
for i, page in enumerate(doc):
    page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4)).save(out / f'page-{i+1}.png')
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            for span in line['spans']:
                x0, y0, x1, y1 = span['bbox']
                assert x0 >= 0 and y0 >= 0 and x1 <= page.rect.width and y1 <= page.rect.height, (i+1, span['text'], span['bbox'])
    print(f'Page {i+1}: {len(page.get_text())} characters; rendered')
print('All four pages are within their page bounds.')
