/**
 * Very simple translations system that uses functions to get the translation
 */

import { ZodIssue } from "zod";

const ENGLISH_TRANSLATIONS = {
    /**
     * In english translations we can just use the default error messages from Zod
     */
    badPassword(issue: ZodIssue) {
        return issue.message;
    },

    badUsername(issue: ZodIssue) {
        return issue.message;
    },

    validationStatus() {
        return "Validation status:";
    },

    signup() {
        return "Signup!";
    },

    language() {
        return "Language";
    },

    name() {
        return "Name";
    },

    password() {
        return "Password";
    },
};

/**
 * Match the Finnish translations to the English ones using the typeof
 * ENGLISH_TRANSLATIONS
 */
const FINNISH_TRANSLATIONS: typeof ENGLISH_TRANSLATIONS = {
    badPassword(issue: ZodIssue) {
        // Use custom translations for the issues used in this field
        if (issue.code === "too_small") {
            return `Salasanan täytyy olla vähintään ${issue.minimum} merkkiä pitkä`;
        }

        // We can target the Zod custom refinements too using .params option
        if (
            issue.code === "custom" &&
            issue.params?.code === "number_missing"
        ) {
            return "Salasanassa täytyy olle vähintään yksi numero";
        }

        // Fallback to to the Zod default error message if forget to translate
        return issue.message;
    },

    badUsername(issue: ZodIssue) {
        if (issue.code === "too_small") {
            return `Käyttäjätunnuksen täytyy olla vähintään ${issue.minimum} merkkiä pitkä`;
        }

        return issue.message;
    },

    validationStatus() {
        return "Lomakkeen tila: ";
    },

    signup() {
        return "Luo tunnus!";
    },

    name() {
        return "Nimi";
    },

    language() {
        return "Kieli";
    },

    password() {
        return "Salasana";
    },
};

export function useTranslations(lang: "en" | "fi") {
    if (lang === "en") {
        return ENGLISH_TRANSLATIONS;
    } else {
        return FINNISH_TRANSLATIONS;
    }
}
