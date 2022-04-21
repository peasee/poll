import axios from "axios";

function apiPath(route) {
    return `${API_HOST}/api${route}`;
}

function wait(ms) {
    ms = ms ?? (Math.floor(Math.random() * 1400) + 100);

    return new Promise(res=>setTimeout(res, ms));
}

export async function get(route) {
    try {
        await wait();
        const request = await axios.get(apiPath(route), {timeout: 7500});

        if(request.data.error) throw new Error(request.data.error);
        else return request.data;
    } catch (err) {
        console.error(err);

        return {error: err.message};
    }
}

export async function post(route, body) {
    try {
        await wait();
        const request = await axios.post(apiPath(route), body, {timeout: 7500});

        if(request.data.error) throw new Error(request.data.error);
        else return request.data;
    } catch (err) {
        console.error(err);

        return {error: err.message};
    }
}