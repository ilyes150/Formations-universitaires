import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

fields_path = os.path.join(BASE, 'data', 'config', 'fields.json')
output_path = os.path.join(BASE, 'data', 'combined.json')

with open(fields_path, 'r', encoding='utf-8') as f:
    fields = json.load(f)

for field in fields['fields']:
    code = field['code']
    config_path = os.path.join(BASE, 'data', 'config', f'{code}.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            field['data'] = json.load(f)
    else:
        field['data'] = None

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(fields, f, ensure_ascii=False, indent=2)

print(f"Built combined.json with {len(fields['fields'])} fields")