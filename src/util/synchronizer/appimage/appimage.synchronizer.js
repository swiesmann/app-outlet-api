const appImageRepository = require('../../../repository/appimage.repository')
const appRepository = require('../../../repository/app.repository')
const categoryRepository = require('../../../repository/category.repository')
const tagService = require('../../../service/tag/tag.service')
const { flatMap, map, bufferCount, filter, first } = require('rxjs/operators')
const { from } = require('rxjs')

module.exports = function synchronizeAppImage() {
    return appImageRepository.getApps()
        .pipe(
            flatMap(from),
            filter(app => app.authors != undefined),
            map(convertToOutletApp),
            flatMap(saveTags),
            flatMap(appRepository.save),
            bufferCount(Number.MAX_VALUE)
        )
}


function saveTags(outletApp) {
    return from(outletApp.tags)
        .pipe(
            filter(tag => tag != null),
            flatMap(tagService.save),
            bufferCount(outletApp.tags.length),
            map(() => outletApp)
        )
}

function convertToOutletApp(appImageApp) {
    return {
        _id: generateId(appImageApp),
        name: appImageApp.name,
        tags: appImageApp.categories,
        icon: getIcon(appImageApp),
        screenshots: getScreenshots(appImageApp),
        shortDescription: appImageApp.description,
        fullDescription: appImageApp.description,
        store: 'appimagehub',
        type: 'AppImage',
        installScript: '',
        bugtrackerUrl: getBugtrackerUrl(appImageApp),
        developer: getDeveloper(appImageApp),
        homepage: getHomepage(appImageApp),
        license: appImageApp.license,
        storeUrl: getStoreUrl(appImageApp),
        downloadLink: getDownloadLink(appImageApp)
    }
}

function getStoreUrl(appImageApp) {
    return `https://appimage.github.io/${appImageApp.name}`
}

function getDeveloper(appImageApp) {
    try {
        const author = appImageApp.authors[0].name
        return author
    } catch (error) {
        return ''
    }
}

function getBugtrackerUrl(appImageApp) {
    const homepage = getHomepage(appImageApp)
    if (homepage) {
        return `${homepage}/issues`
    } else {
        return ''
    }
}

function getDownloadLink(appImageApp) {
    try {
        const downloadLink = appImageApp.links.find(link => link.type == 'GitHub')
        return downloadLink.url
    } catch (ex) {
        return ''
    }
}

function getHomepage(appImageApp) {
    const githubLink = appImageApp.links.find(link => link.type == 'GitHub')
    if (githubLink) {
        return `https://github.com/${githubLink.url}`
    } else {
        return ''
    }
}

function generateId(appImageApp) {
    const author = appImageApp.authors[0]
    return `${author.name}.${appImageApp.name}`
}

function getScreenshots(appImageApp) {
    const screenshots = []
    if (appImageApp.screenshots) {
        appImageApp.screenshots.forEach(element => {
            screenshots.push(parseScreenshotUrl(element))
        });
    }
    return screenshots
}

function parseScreenshotUrl(screenshotRef) {
    return `https://appimage.github.io/database/${screenshotRef}`
}

function getIcon(appImageApp) {
    try {
        const icon = appImageApp.icons[0]
        return `https://gitcdn.xyz/repo/AppImage/appimage.github.io/master/database/${icon}`
    } catch (ex) {
        return ""
    }
}