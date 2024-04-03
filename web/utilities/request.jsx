import axios from "axios";

function apiPath(route) {
    return `${API_HOST}/api${route}`;
}

function wait(ms) {
    ms = ms ?? (Math.floor(Math.random() * 1400) + 100);

    return new Promise(res => setTimeout(res, ms));
}

export async function captcha(action) {
    // optional - if recaptcha is not enabled
    if (`${RECAP_SITE_KEY}` == "") return Promise.resolve(null);

    return new Promise((res, rej) => {
        try {
            grecaptcha.ready(() => {
                grecaptcha.execute(`${RECAP_SITE_KEY}`, { action }).then(token => {
                    return res(token);
                });
            });
        } catch (err) {
            return rej(err);
        }
    });
}

export async function get(route) {
    try {
        await wait();
        const request = await axios.get(apiPath(route), { timeout: 7500, validateStatus: () => true });

        if (request.data.error) throw new Error(request.data.error);
        else if (request.status > 399) throw new Error(`Request failed with code ${request.status}`);
        else return request.data;
    } catch (err) {
        console.error(err);

        return { error: err.message };
    }
}

export async function post(route, body) {
    try {
        await wait();
        const request = await axios.post(apiPath(route), body, { timeout: 7500, validateStatus: () => true });

        if (request.data.error) throw new Error(request.data.error);
        else if (request.status > 399) throw new Error(`Request failed with code ${request.status}`);
        else return request.data;
    } catch (err) {
        console.error(err);

        return { error: err.message };
    }
}