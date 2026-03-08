export const fetcher = (url) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('An error occurred while fetching data.');
    return res.json();
});