"""Build and verify the source-only Canvas archive from the outer workspace."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib

root = Path(__file__).resolve().parents[1]
project = root / "tweeter-web-starter"
archive = root / "tweeter.zip"
excluded = {".git", ".aws", ".agents", ".codex", "node_modules", "dist", "output", "tmp", "coverage", "__pycache__"}
files = {}
for path in sorted(project.rglob("*")):
    relative = path.relative_to(project)
    if (not path.is_file() or path.is_symlink() or any(part in excluded for part in relative.parts)
            or path.name.startswith(".env") or path.name == ".DS_Store" or path.suffix in {".zip", ".pyc", ".log"}):
        continue
    files["tweeter-web-starter/" + relative.as_posix()] = path
for path in sorted((root / "docs").glob("*")):
    if path.is_file():
        files["tweeter-web-starter/docs/" + path.name] = path
files["tweeter-web-starter/output/pdf/milestone-2-report.pdf"] = root / "output/pdf/milestone-2-report.pdf"
assert files["tweeter-web-starter/package-lock.json"].is_file()
assert sum(name.endswith((".test.ts", ".test.tsx")) for name in files) == 5
with ZipFile(archive, "w", ZIP_DEFLATED) as z:
    for name, path in files.items():
        z.write(path, name)
with ZipFile(archive) as z:
    assert z.testzip() is None
    assert set(z.namelist()) == set(files)
    for name, path in files.items():
        assert hashlib.sha256(z.read(name)).digest() == hashlib.sha256(path.read_bytes()).digest(), name
print(f"{archive}: {len(files)} files; {archive.stat().st_size:,} bytes; all contents verified against source")
