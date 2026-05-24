import json
import re

log_path = r'C:\Users\Virat\.gemini\antigravity\brain\4a122d46-e248-4eb5-80f9-d1cde1e758ec\.system_generated\logs\overview.txt'
with open(log_path, 'r', encoding='utf-8') as f:
    content = f.read()

for filename in ['AddProject.jsx', 'AddUser.jsx', 'AddTask.jsx']:
    pattern = r'\"TargetFile\":\"[^\"]*?' + filename + r'\",.*?\"CodeContent\":\"(.*?)\"(?:,|})'
    matches = list(re.finditer(pattern, content, re.DOTALL))
    if matches:
        last_match = matches[-1]
        code_content = last_match.group(1)
        try:
            code = json.loads('\"' + code_content + '\"')
            with open(f'c:/Users/Virat/Downloads/crm_admin/fe/src/pages/{filename}', 'w', encoding='utf-8') as out_f:
                out_f.write(code)
            print(f'Recovered {filename}')
        except Exception as e:
            print(f'Failed parsing {filename}: {e}')
    else:
        print(f'No match {filename}')
