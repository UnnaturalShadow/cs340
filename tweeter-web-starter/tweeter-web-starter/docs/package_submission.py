"""Package only project source, tests, and documentation for Canvas."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import subprocess

root = Path(__file__).resolve().parents[1]
tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
files = {root / path for path in tracked if path}
for folder in ['docs', 'tweeter-web/test']:
    files.update((root / folder).rglob('*'))
files.update(root / path for path in ['tweeter-web/jest.config.cjs', 'tweeter-web/tsconfig.test.json', 'output/pdf/milestone-2-report.pdf'])
archive = root / 'output/milestone-2-project.zip'
with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
    for path in sorted(files):
        relative = path.relative_to(root)
        if not path.is_file() or any(part in {'.git', '.aws', 'node_modules', 'dist', '__pycache__'} for part in relative.parts):
            continue
        if path.name.startswith('.env') or path.suffix in {'.zip', '.pyc'}:
            continue
        z.write(path, relative)
with ZipFile(archive) as z:
    assert z.testzip() is None
    assert len([p for p in z.namelist() if p.endswith(('.test.ts', '.test.tsx'))]) == 5
    assert 'output/pdf/milestone-2-report.pdf' in z.namelist()
    print(f'{archive}: {len(z.namelist())} files, {archive.stat().st_size} bytes; integrity checked')
