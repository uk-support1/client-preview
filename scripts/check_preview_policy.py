#!/usr/bin/env python3
"""Public client-preview repository safety checks (no network dependencies)."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CASE_PATTERN = re.compile(r"case-\d{4}-[a-z0-9]{4}\Z")
BLOCKED_SUFFIXES = {".env", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".sql", ".zip", ".pem", ".key"}


class RobotsMetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.has_noindex_nofollow = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "meta":
            return
        properties = {key.lower(): (value or "").lower() for key, value in attrs}
        if properties.get("name") != "robots":
            return
        directives = {value.strip() for value in properties.get("content", "").split(",")}
        if {"noindex", "nofollow"}.issubset(directives):
            self.has_noindex_nofollow = True


def validate_html(path: Path, problems: list[str]) -> None:
    if not path.is_file():
        problems.append(f"Missing HTML file: {path.relative_to(ROOT)}")
        return
    parser = RobotsMetaParser()
    parser.feed(path.read_text(encoding="utf-8"))
    if not parser.has_noindex_nofollow:
        problems.append(f"Missing noindex, nofollow: {path.relative_to(ROOT)}")


def main() -> int:
    problems: list[str] = []
    robots = ROOT / "robots.txt"
    if not robots.is_file():
        problems.append("Missing root robots.txt")
    else:
        contents = robots.read_text(encoding="utf-8")
        if not re.search(r"(?im)^User-agent:\s*\*\s*$", contents):
            problems.append("robots.txt must target all user agents")
        if not re.search(r"(?im)^Disallow:\s*/\s*$", contents):
            problems.append("robots.txt must disallow /")

    validate_html(ROOT / "index.html", problems)
    root_index = ROOT / "index.html"
    if root_index.is_file() and re.search(r"case-\d{4}-[a-z0-9]{4}", root_index.read_text(encoding="utf-8")):
        problems.append("Root index.html must not list case URLs")

    case_dirs = sorted(path for path in ROOT.iterdir() if path.is_dir() and path.name.startswith("case-"))
    if len(case_dirs) > 1:
        problems.append(f"Only one active case is allowed; found {len(case_dirs)}")

    for case in case_dirs:
        if not CASE_PATTERN.fullmatch(case.name):
            problems.append(f"Invalid case folder name: {case.name}")
        validate_html(case / "index.html", problems)
        for path in case.rglob("*"):
            if path.is_file() and path.suffix.lower() == ".html" and path.name != "index.html":
                validate_html(path, problems)
            if path.is_file() and path.suffix.lower() in BLOCKED_SUFFIXES:
                problems.append(f"Do not publish source documents or sensitive formats: {path.relative_to(ROOT)}")

    if problems:
        print("Client preview policy FAILED:")
        for problem in problems:
            print(f" - {problem}")
        return 1
    print(f"Client preview policy passed ({len(case_dirs)} active case).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
