const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getUrl = (path: string) => `${BASE_URL}/${path}`;

export const URL_CONSTANTS = {
    createOrUpdateUser: getUrl("users/create-or-update"),
}