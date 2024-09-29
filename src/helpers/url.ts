

//fix the url in the event the user put www or anything besides that 
export const fixUrl = (url: string): string => {
    url = url.trim();
    if (url.startsWith('www.')) {
        url = 'https://' + url;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    return url;
};

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

