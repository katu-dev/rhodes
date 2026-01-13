
import json
import urllib.request
import os

# URL for English Arknights Character Data
DATA_URL = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/master/en_US/gamedata/excel/character_table.json"

# Local file path for checking added characters
CHARACTERS_JS_PATH = r"c:\Users\Eloi\dev\rhodes\src\data\characters.js"
OUTPUT_MD_PATH = r"c:\Users\Eloi\dev\rhodes\ARKNIGHTS_CHARACTERS.md"

# Class Mapping
PROFESSION_MAP = {
    "MEDIC": "Medic",
    "WARRIOR": "Guard",
    "PIONEER": "Vanguard", # Wait, usually it is PIONEER in some data, but let's check. 
    # Actually, in global files: 
    # MEDIC, WARRIOR, SNIPER, CASTER, SUPPORT, TANK, SPECIAL, PIONEER (Vanguard?)
    # Let's verify standard mapping:
    "SNIPER": "Sniper",
    "CASTER": "Caster",
    "SUPPORT": "Supporter",
    "TANK": "Defender",
    "SPECIAL": "Specialist", 
    "TOKEN": "Token", # Summons
    "TRAP": "Trap",
}
# Correction: Vanguard is often "PIONEER" in CN data but might be "VANGUARD" in EN? 
# Character table usually uses: WARRIOR, SNIPER, TANK, MEDIC, SUPPORT, CASTER, SPECIAL, PIONEER.
# Yes, PIONEER maps to Vanguard.

def get_added_characters(js_path):
    """
    Naively parses the characters.js file to find names of characters added.
    Looks for lines like: name: 'Heidi',
    """
    added_names = set()
    try:
        with open(js_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Simple string search or regex could work. 
            # Given the file format, looking for name: 'String' is safest.
            import re
            matches = re.findall(r"name:\s*'([^']+)'", content)
            for m in matches:
                added_names.add(m)
            # Also double quotes
            matches_dq = re.findall(r'name:\s*"([^"]+)"', content)
            for m in matches_dq:
                added_names.add(m)
    except Exception as e:
        print(f"Error reading characters.js: {e}")
    return added_names

def fetch_character_data():
    print(f"Fetching data from {DATA_URL}...")
    try:
        with urllib.request.urlopen(DATA_URL) as url:
            data = json.loads(url.read().decode())
            return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def generate_markdown(char_data, added_names):
    lines = []
    lines.append("# Arknights Operators Reference")
    lines.append("")
    lines.append("| Name | Class | Branch | Added in Game? |")
    lines.append("|---|---|---|---|")

    # Sort characters by name
    # Filter out non-operators (tokens, traps, campaigns)
    # Characters typically have 'profession' and 'rarity' (0-5 for 1-6 stars)
    
    valid_chars = []
    
    for char_id, char_info in char_data.items():
        # Filter out tokens, traps, etc. 
        # Real operators have a reasonable rarity and profession.
        name = char_info.get("name")
        profession = char_info.get("profession")
        sub_profession = char_info.get("subProfessionId", "")
        
        # Skip if name is empty or looks like a token ID without a proper name
        if not name: 
            continue
            
        # Basic filtering to exclude enemies/tokens if mixed in (usually not in character_table, but safe to check)
        # We can check itemUsage or description.
        # But mostly, just profession check.
        if profession not in ["MEDIC", "WARRIOR", "SNIPER", "CASTER", "SUPPORT", "TANK", "SPECIAL", "PIONEER"]:
            continue
            
        # Refine Class Name
        class_name = PROFESSION_MAP.get(profession, profession.title())
        if class_name == "PIONEER": class_name = "Vanguard"
        if class_name == "SPECIAL": class_name = "Specialist"
        if class_name == "WARRIOR": class_name = "Guard"
        if class_name == "TANK": class_name = "Defender"
        if class_name == "SUPPORT": class_name = "Supporter"
        
        # Branch (subProfessionId is usually like 'funnel' or 'bard', need to format)
        branch = sub_profession.replace("_", " ").title() if sub_profession else "-"
        
        # Check if added
        is_added = "**YES**" if name in added_names else "No"
        
        valid_chars.append((name, class_name, branch, is_added))

    # Sort by Name
    valid_chars.sort(key=lambda x: x[0])

    for char in valid_chars:
        lines.append(f"| {char[0]} | {char[1]} | {char[2]} | {char[3]} |")

    lines.append("")
    lines.append(f"> **Note**: Data fetched from official Arknights game data. Total Operators: {len(valid_chars)}.")

    with open(OUTPUT_MD_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    
    print(f"Successfully generated {OUTPUT_MD_PATH} with {len(valid_chars)} operators.")

def main():
    added_names = get_added_characters(CHARACTERS_JS_PATH)
    print(f"Found {len(added_names)} characters added in game.")
    
    data = fetch_character_data()
    if data:
        generate_markdown(data, added_names)

if __name__ == "__main__":
    main()
