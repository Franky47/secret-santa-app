import Vue from 'vue'
import VueI18n from 'vue-i18n'

export const localeNames = {
    'en': 'English',
    'fr': 'Français'
}

export const supportedLocales = {
    'en': /en[-_]?.*/,
    'fr': /fr[-_]?.*/
}

export const getSuitableLocaleFor = locale => {
    let matched = null
    for (const key in supportedLocales) {
        if (locale.match(supportedLocales[key])) {
            matched = key
            break
        }
    }
    return matched || 'en'
}

export const loadLocale = locale => {
    return new Promise((resolve, reject) => {
        try {
            Vue.locale(locale, require(`./translations/${locale}`).default)
            resolve(locale)
        } catch (error) {
            reject(error)
        }
    })
}

Vue.use(VueI18n)
