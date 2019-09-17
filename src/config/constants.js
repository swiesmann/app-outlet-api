module.exports = {
    port: process.env.PORT || 3001,
    devMode: process.env.OUTLET_DEV_MODE || true,
    databaseUrl: process.env.OUTLET_DATABASE_URL || '',
    synchronizationInterval: process.env.OUTLET_SYNC_INTERVAL || 1000 * 60, // Default: 1 minute
    searchLimit: process.env.OUTLET_SEARCH_LIMIT || 30,
    allowSync: process.env.OUTLET_ALLOW_SYNC || 'true'
}