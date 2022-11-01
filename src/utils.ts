export const isUrl = (url: any) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}
