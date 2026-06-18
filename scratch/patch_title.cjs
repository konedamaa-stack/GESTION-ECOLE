const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetTitle = `<h3 className="panel-title">Suivi des Paiements par Élève</h3>`;
const replacementTitle = `<h3 className="panel-title" style={{textTransform: 'uppercase'}}>
            {(() => {
              if (financeStatusFilter === 'all' && financeClassFilter === 'all') return 'SUIVI DES PAIEMENTS PAR ÉLÈVE';
              const statusPart = financeStatusFilter === 'all' ? '' : (financeStatusFilter === 'Soldé' ? 'SOLDE' : 'NON SOLDE');
              const classPart = financeClassFilter === 'all' ? '' : 'DE CLASSE ' + (classesData.find(c => c.id === financeClassFilter)?.name || '').toUpperCase();
              return \`LA LISTE DES ELEVES \${statusPart} \${classPart}\`.replace(/\\s+/g, ' ').trim();
            })()}
          </h3>`;

if (content.includes(targetTitle)) {
  content = content.replace(targetTitle, replacementTitle);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Patch complete');
