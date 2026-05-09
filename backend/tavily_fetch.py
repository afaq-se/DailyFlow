#!/usr/bin/env python3
"""
Fetch latest news, motivational quotes, and productivity tips from Tavily.
Usage: python3 tavily_fetch.py
"""

import os
import json
from datetime import date
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("TAVILY_API_KEY", "")
BASE_URL = "https://api.tavily.com/search"


def search(query: str, max_results: int = 3, search_depth: str = "basic") -> list:
    import requests

    resp = requests.post(
        BASE_URL,
        json={
            "api_key": API_KEY,
            "query": query,
            "search_depth": search_depth,
            "max_results": max_results,
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json().get("results", [])


def print_section(title: str, results: list) -> None:
    print(f"\n{'━' * 52}")
    print(f"  {title}")
    print(f"{'━' * 52}")
    if not results:
        print("  No results found.")
        return
    for i, r in enumerate(results, 1):
        print(f"\n  [{i}] {r.get('title', 'No title')}")
        print(f"      {r.get('url', '')}")
        content = r.get("content", "").strip()
        if content:
            # Wrap at 70 chars
            words = content.split()
            line, lines = [], []
            for word in words:
                if sum(len(w) + 1 for w in line) + len(word) > 70:
                    lines.append(" ".join(line))
                    line = [word]
                else:
                    line.append(word)
            if line:
                lines.append(" ".join(line))
            for ln in lines[:3]:  # max 3 lines of content
                print(f"      {ln}")


def main():
    if not API_KEY:
        print("Error: TAVILY_API_KEY not set in .env")
        return

    today = date.today().isoformat()
    print(f"\n  TAVILY DAILY FETCH — {today}")

    queries = [
        ("Tech News Today", f"latest technology news developers {today}", 3),
        ("Productivity Tips", f"developer productivity tips best practices {today}", 3),
        ("Motivational Quotes", "best motivational quotes for focus and productivity", 3),
        ("AI & Tools", f"AI tools developers workflow {today}", 3),
    ]

    for title, query, max_results in queries:
        try:
            results = search(query, max_results=max_results)
            print_section(title, results)
        except Exception as e:
            print(f"\n  [{title}] Failed: {e}")

    print(f"\n{'━' * 52}\n")


if __name__ == "__main__":
    main()
