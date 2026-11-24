#!/usr/bin/env python3
"""最終更新から90日以上経った確認用フォルダ（case-*）を一覧にする。

git の履歴から各フォルダの最終更新日を調べる。結果は Markdown で標準出力に出し、
該当があれば終了コード 0、なければ 2 を返す（ワークフローで使い分けるため）。
"""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
STALE_DAYS = 90


def last_commit_time(path: Path) -> datetime | None:
    out = subprocess.run(
        ["git", "log", "-1", "--format=%cI", "--", str(path.relative_to(ROOT))],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout.strip()
    return datetime.fromisoformat(out) if out else None


def main() -> int:
    now = datetime.now(timezone.utc)
    stale = []
    for case in sorted(p for p in ROOT.iterdir() if p.is_dir() and p.name.startswith("case-")):
        updated = last_commit_time(case)
        if updated is None:
            continue
        days = (now - updated).days
        if days >= STALE_DAYS:
            stale.append((case.name, updated.date().isoformat(), days))
    if not stale:
        print("最終更新から90日以上経った確認用ページはありません。")
        return 2
    print("最終更新から3か月（90日）以上経った確認用ページがあります。確認が終わっていれば削除してよいか、上原さんに確かめてください。\n")
    print("| フォルダ | 最終更新 | 経過日数 |")
    print("|---|---|---|")
    for name, date, days in stale:
        print(f"| `{name}` | {date} | {days}日 |")
    print("\n削除するときは、フォルダの削除と履歴からの消去が必要です（強制プッシュを伴うため、実行前に上原さんの確認を取る）。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
