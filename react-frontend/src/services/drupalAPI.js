const API_URL = "https://drupal-headless.ddev.site/jsonapi/node/article";
const AUTH_URL = "https://drupal-headless.ddev.site/oauth/token";
const CLIENT_ID = "AunLDNFHUcM_G0XSGI-_3yIgp_6igeLnfaw-c-ijZgI";
const CLIENT_SECRET = "react-app-client-secret";

const getAuthToken = async () => {
    let accessToken = localStorage.getItem("auth_token");
    let refreshToken = localStorage.getItem("refresh_token");
    let tokenExpiry = localStorage.getItem("token_expiry");

    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken; // Use stored token if it's still valid
    }

    if (refreshToken) {
        return await refreshAuthToken(refreshToken);
    }

    return await requestNewAuthToken();
};

const requestNewAuthToken = async () => {
    const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "password",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            username: "react",
            password: "react.content_editor@yopmail.com",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to authenticate");
    } 

    const data = await response.json();
    storeAuthData(data);
    return data.access_token;
};

const refreshAuthToken = async (refreshToken) => {
    const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        console.warn("Refresh token expired. Requesting new login.");
        return await requestNewAuthToken();
    }

    const data = await response.json();
    storeAuthData(data);
    return data.access_token;
};

const storeAuthData = (data) => {
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000);
};

export const fetchArticles = async () => {
    const response = await fetch(`${API_URL}?include=field_image`);
    const data = await response.json();

    return data.data.map((article) => {
        const imageId = article.relationships.field_image?.data?.id;
        const imageData = data.included?.find((item) => item.id === imageId);
        const imageUrl = imageData ? imageData.attributes.uri.url : null;

        return {
            uuid: article.id,
            id: article.attributes.drupal_internal__nid,
            title: article.attributes.title,
            body: article.attributes.body.value,
            imageUrl: imageUrl ? `https://drupal-headless.ddev.site${imageUrl}` : null,
        };
    });
};

export const createArticle = async (title, body) => {
    const authToken = await getAuthToken();
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/vnd.api+json",
            "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            data: {
                type: "node--article",
                attributes: {
                    title: title,
                    body: { value: body, format: "full_html" },
                },
            },
        }),
    });

    return response.json();
};

export const updateArticle = async (id, title, body) => {
    const authToken = await getAuthToken();
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/vnd.api+json",
            "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            data: {
                id: id,
                type: "node--article",
                attributes: {
                    title: title,
                    body: { value: body, format: "full_html" },
                },
            },
        }),
    });

    return response.json();
};

export const deleteArticle = async (id) => {
    const authToken = await getAuthToken();
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${authToken}`,
        },
    });

    return response.ok;
};