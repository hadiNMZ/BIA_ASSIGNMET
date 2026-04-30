import argparse
import asyncio
import os
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from sqlalchemy import insert, text

from core.database import create_tables, engine
from core.models import Behavior, Product, Rating, User


DATA_FILES = {
    "users": "users.xlsx",
    "products": "products.xlsx",
    "ratings": "ratings.xlsx",
    "behaviors": "behavior_15500.xlsx",
}

SHEET_NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def _default_data_dir() -> Path:
    candidates = [
        os.getenv("DATA_DIR"),
        Path.cwd() / "data",
        Path(__file__).resolve().parents[1] / "data",
        Path(__file__).resolve().parents[2] / "data",
    ]

    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return Path(candidate)

    return Path.cwd() / "data"


def _load_shared_strings(workbook: ZipFile) -> list[str]:
    root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
    return [
        "".join(text.text or "" for text in item.findall(".//s:t", SHEET_NS))
        for item in root.findall("s:si", SHEET_NS)
    ]


def _cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    value = cell.find("s:v", SHEET_NS)
    if value is None:
        inline_text = cell.find("s:is/s:t", SHEET_NS)
        return inline_text.text if inline_text is not None else ""

    if cell.attrib.get("t") == "s":
        return shared_strings[int(value.text)]

    return value.text or ""


def _read_excel_records(data_dir: Path, filename: str) -> list[dict]:
    path = data_dir / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing data file: {path}")

    with ZipFile(path) as workbook:
        shared_strings = _load_shared_strings(workbook)
        root = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
        rows = root.findall(".//s:sheetData/s:row", SHEET_NS)

    headers = [
        _cell_value(cell, shared_strings)
        for cell in rows[0].findall("s:c", SHEET_NS)
    ]

    return [
        {
            header: _cell_value(cell, shared_strings)
            for header, cell in zip(headers, row.findall("s:c", SHEET_NS))
        }
        for row in rows[1:]
    ]


def _to_bool(value: object) -> bool:
    return bool(int(value))


def _dedupe_behaviors(records: list[dict]) -> list[dict]:
    deduped: dict[tuple[int, int], dict] = {}

    for record in records:
        key = (record["user_id"], record["product_id"])
        if key not in deduped:
            deduped[key] = record
            continue

        deduped[key]["viewed"] = deduped[key]["viewed"] or record["viewed"]
        deduped[key]["clicked"] = deduped[key]["clicked"] or record["clicked"]
        deduped[key]["purchased"] = deduped[key]["purchased"] or record["purchased"]

    return list(deduped.values())


def _load_records(data_dir: Path) -> dict[str, list[dict]]:
    users = _read_excel_records(data_dir, DATA_FILES["users"])
    products = _read_excel_records(data_dir, DATA_FILES["products"])
    ratings = _read_excel_records(data_dir, DATA_FILES["ratings"])
    behaviors = _read_excel_records(data_dir, DATA_FILES["behaviors"])

    behavior_records = [
        {
            "user_id": int(record["user_id"]),
            "product_id": int(record["product_id"]),
            "viewed": _to_bool(record["viewed"]),
            "clicked": _to_bool(record["clicked"]),
            "purchased": _to_bool(record["purchased"]),
        }
        for record in behaviors
    ]

    return {
        "users": [
            {
                "user_id": int(record["user_id"]),
                "age": int(record["age"]),
                "country": str(record["country"]),
            }
            for record in users
        ],
        "products": [
            {
                "product_id": int(record["product_id"]),
                "category": str(record["category"]),
                "price": int(record["price"]),
            }
            for record in products
        ],
        "ratings": [
            {
                "user_id": int(record["user_id"]),
                "product_id": int(record["product_id"]),
                "rating": int(record["rating"]),
            }
            for record in ratings
        ],
        "behaviors": _dedupe_behaviors(behavior_records),
    }


async def import_excel_data(data_dir: Path | None = None) -> dict[str, int]:
    data_dir = data_dir or _default_data_dir()
    records = _load_records(data_dir)

    await create_tables()
    print("Craeted the Tables.")

    async with engine.begin() as conn:
        await conn.execute(
            text(
                "TRUNCATE TABLE behaviors, ratings, products, users "
                "RESTART IDENTITY CASCADE"
            )
        )
        await conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_behaviors_user_id_product_id "
                "ON behaviors (user_id, product_id)"
            )
        )
        await conn.execute(insert(User), records["users"])
        await conn.execute(insert(Product), records["products"])
        await conn.execute(insert(Rating), records["ratings"])
        await conn.execute(insert(Behavior), records["behaviors"])

    return {name: len(items) for name, items in records.items()}


async def _main() -> None:
    parser = argparse.ArgumentParser(description="Import Excel data into Postgres.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=None,
        help="Directory containing users.xlsx, products.xlsx, ratings.xlsx, and behavior_15500.xlsx.",
    )
    args = parser.parse_args()

    counts = await import_excel_data(args.data_dir)
    for table, count in counts.items():
        print(f"{table}: {count}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(_main())
