import sys

file_path = 'src/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (
        "style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}",
        "className=\"form-grid\""
    ),
    (
        "style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px'}}",
        "className=\"form-grid\" style={{marginTop: '16px'}}"
    ),
    (
        "style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}",
        "className=\"form-grid\" style={{gap: '12px'}}"
    ),
    (
        "style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}",
        "className=\"form-grid\" style={{marginBottom: '24px'}}"
    ),
    (
        "style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px'}}",
        "className=\"form-grid\" style={{maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px'}}"
    )
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
