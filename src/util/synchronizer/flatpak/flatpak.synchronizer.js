const flatpakRepository = require('../../../repository/flatpak.repository')
const appRepository = require('../../../repository/app.repository')
const categoryRepository = require('../../../repository/category.repository')
const logger = require('../../logger')
const { map, flatMap, bufferCount } = require('rxjs/operators')
const { from } = require('rxjs')

function synchronizeFlatpak() {
    return flatpakRepository.getApps()
        .pipe(
            flatMap(from),
            flatMap(app => flatpakRepository.getAppDetails(app.flatpakAppId)),
            map(convertToOutletApp),
            flatMap(saveCategories),
            flatMap(appRepository.save),
            bufferCount(Number.MAX_VALUE)
        )
}

function saveCategories(outletApp) {
    return from(outletApp.categories)
        .pipe(
            flatMap(categoryRepository.save),
            bufferCount(outletApp.categories),
            map(() => outletApp)
        )
}

function convertToOutletApp(flatpakApp) {
    return {
        _id: flatpakApp.flatpakAppId,
        name: flatpakApp.name,
        categories: convertToOutletCategory(flatpakApp.categories),
        icon: flatpakApp.iconDesktopUrl,
        screenshots: convertToOutletScreenshots(flatpakApp.screenshots),
        shortDescription: flatpakApp.summary,
        fullDescription: flatpakApp.description,
        store: 'flathub',
        installScript: '',
        releaseDate: new Date(flatpakApp.inStoreSinceDate),
        lastUpdateDate: new Date(flatpakApp.currentReleaseDate),
        version: flatpakApp.currentReleaseVersion,
        bugtrackerUrl: flatpakApp.bugtrackerUrl,
        developer: flatpakApp.developerName,
        donationUrl: flatpakApp.donationUrl,
        flatpakAppId: flatpakApp.flatpakAppId,
        homepage: flatpakApp.homepageUrl,
        license: flatpakApp.projectLicense
    }
}

function convertToOutletCategory(flatpakCategories) {
    const categories = []
    flatpakCategories.forEach(category => {
        categories.push(category.name)
    })
    return categories
}

function convertToOutletScreenshots(flatpakAppScreenshots) {
    const screenshots = []
    flatpakAppScreenshots.forEach(screenshot => {
        screenshots.push(screenshot.imgDesktopUrl)
    })
    return screenshots
}

module.exports = synchronizeFlatpak