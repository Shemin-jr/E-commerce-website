// Quick check if lodash is properly installed
try {
    const lodash = require('lodash');
    const debounce = require('lodash/debounce');
    console.log('✅ lodash is installed correctly');
    console.log('✅ lodash version:', require('lodash/package.json').version);
    console.log('✅ debounce function is available:', typeof debounce === 'function');
} catch (err) {
    console.error('❌ Error:', err.message);
}
