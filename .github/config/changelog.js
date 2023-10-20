module.exports = {
  types: [
    { types: ['feat', 'feature'], label: '🎉 New feature' },
    { types: ['fix', 'bugfix'], label: '🐛 Bug fix' },
    { types: ['improvements', 'enhancement'], label: '🔨 Improvement' },
    { types: ['build', 'ci'], label: '🏗️ Deployment' },
    { types: ['refactor'], label: '🪚 Refactor' },
    { types: ['perf'], label: '🏎️ Performance improvement' },
    { types: ['doc', 'docs'], label: '📚 Documentation' },
    { types: ['test', 'tests'], label: '🔍 Tests' },
    { types: ['style'], label: '💅 Style' },
    { types: ['chore'], label: '🧹 Cleaning' },
    { types: ['other'], label: 'Other' },
  ],

  excludeTypes: [
    'other',
    'perf',
    'test',
    'tests',
    'style',
    'chore',
    'doc',
    'docs',
  ],
};
