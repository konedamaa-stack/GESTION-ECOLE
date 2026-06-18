const fs = require('fs');

let content = fs.readFileSync('src/index.css', 'utf8');

const mobileFixes = `

/* MOBILE RESPONSIVENESS FIXES */
@media screen and (max-width: 768px) {
  /* Fix user email overflowing */
  .user-info {
    max-width: 90px;
  }
  .user-name {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
  }
  
  /* Fix page headers overflowing */
  .page-header {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center;
    gap: 16px !important;
  }
  
  .panel-header {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center;
    gap: 12px !important;
  }

  /* Fix filter rows and action buttons overflowing */
  .finance-filters, .header-actions, .header-actions[style] {
    flex-wrap: wrap !important;
    justify-content: center !important;
    width: 100% !important;
  }
  
  .finance-filters > *, .header-actions > * {
    flex: 1 1 auto;
    min-width: 130px;
  }
}
`;

if (!content.includes('/* MOBILE RESPONSIVENESS FIXES */')) {
  fs.writeFileSync('src/index.css', content + mobileFixes);
  console.log('Mobile fixes appended to index.css');
} else {
  console.log('Mobile fixes already exist.');
}
