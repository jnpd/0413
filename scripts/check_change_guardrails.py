#!/usr/bin/env python3
from __future__ import annotations

import argparse
import pathlib
import re
import sys
from dataclasses import dataclass


ROOT = pathlib.Path(__file__).resolve().parents[1]


@dataclass
class Finding:
    level: str
    path: pathlib.Path
    message: str


PROPOSAL_REQUIRED_HEADINGS = [
    "## 1. 目标",
    "## 2. 本次做什么",
    "## 3. 本次不做什么",
    "## 4. 事实依据",
    "## 5. 风险",
    "## 6. 验证",
]


HIGH_RISK_PATTERNS = [
    re.compile(r"未定位到.*(接口|实现).*(只能占位|保留占位)"),
    re.compile(r"没找到.*(实现|代码).*(能力不存在|页面不存在)"),
    re.compile(r"读取.*授权树.*(就算|即为|等于).*(权限配置完成)"),
    re.compile(r"后端.*未定位到.*企业管理.*(只能占位|静态说明)"),
]


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def find_feature_paths(feature_id: str) -> tuple[list[pathlib.Path], list[pathlib.Path]]:
    proposal_paths = list((ROOT / "changes").glob(f"*/{feature_id}/proposal.md"))
    openspec_root = ROOT / "openspec" / "changes" / feature_id
    spec_paths: list[pathlib.Path] = []
    if openspec_root.exists():
        for pattern in ("design.md", "tasks.md", "test-cases.md", "acceptance.md"):
            candidate = openspec_root / pattern
            if candidate.exists():
                spec_paths.append(candidate)
        spec_paths.extend(openspec_root.glob("specs/**/*.md"))
        spec_paths.extend(openspec_root.glob("contracts/**/*.md"))
    return proposal_paths, spec_paths


def check_required_headings(path: pathlib.Path, text: str) -> list[Finding]:
    findings: list[Finding] = []
    if path.name != "proposal.md":
        return findings
    for heading in PROPOSAL_REQUIRED_HEADINGS:
        if heading not in text:
            findings.append(Finding("ERROR", path, f"缺少必备章节：{heading}"))
    return findings


def check_high_risk_phrases(path: pathlib.Path, text: str) -> list[Finding]:
    findings: list[Finding] = []
    for pattern in HIGH_RISK_PATTERNS:
        for match in pattern.finditer(text):
            excerpt = match.group(0)
            findings.append(Finding("ERROR", path, f"命中高风险话术：{excerpt}"))
    return findings


def check_foundation_scope(path: pathlib.Path, text: str) -> list[Finding]:
    findings: list[Finding] = []
    lower_name = path.as_posix().lower()
    if "foundation" not in lower_name:
        return findings
    if "不冻结完整业务真相" not in text and "只冻结" not in text:
        findings.append(Finding("WARN", path, "foundation 类文档建议明确写出“只冻结哪些基础能力 / 不冻结哪些业务真相”"))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Check guardrails for change/proposal/spec docs.")
    parser.add_argument("--feature", required=True, help="feature id under changes/<YYYY-MM>/<feature> and openspec/changes/<feature>")
    args = parser.parse_args()

    proposal_paths, spec_paths = find_feature_paths(args.feature)
    if not proposal_paths and not spec_paths:
        print(f"ERROR: 未找到 feature `{args.feature}` 的 proposal 或 openspec 文档。")
        return 2

    findings: list[Finding] = []
    for path in proposal_paths + spec_paths:
        text = read_text(path)
        findings.extend(check_required_headings(path, text))
        findings.extend(check_high_risk_phrases(path, text))
        findings.extend(check_foundation_scope(path, text))

    if not findings:
        print(f"OK: `{args.feature}` 未发现命中的高风险门禁问题。")
        return 0

    error_count = 0
    warn_count = 0
    for item in findings:
        rel = item.path.relative_to(ROOT)
        print(f"{item.level}: {rel} -> {item.message}")
        if item.level == "ERROR":
            error_count += 1
        else:
            warn_count += 1

    print(f"SUMMARY: errors={error_count}, warnings={warn_count}")
    return 1 if error_count else 0


if __name__ == "__main__":
    sys.exit(main())
