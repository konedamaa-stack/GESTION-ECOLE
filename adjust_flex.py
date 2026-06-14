import sys

file_path = 'src/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (
        "style={{display: 'flex', gap: '24px', marginBottom: '16px', background: 'var(--surface-color-hover)', padding: '16px', borderRadius: '8px'}}",
        "style={{display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px', background: 'var(--surface-color-hover)', padding: '16px', borderRadius: '8px'}}"
    ),
    (
        "style={{display: 'flex', gap: '24px', marginBottom: '16px'}}",
        "style={{display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px'}}"
    ),
    (
        "style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'",
        "style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px'"
    ),
    (
        "style={{display: 'flex', gap: '20px', marginBottom: '24px'}}",
        "style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px'}}"
    )
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done flex wrapping!')
