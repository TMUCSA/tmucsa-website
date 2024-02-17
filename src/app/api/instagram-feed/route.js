async function fetchInstagramData() {
    try {
        const data = await fetch({"test": "hello"});
        const feed = await data.json();
        return feed;
    } catch (err) {
        console.error(err);
    }
}

export async function GET() {
    const instagramData = await fetchInstagramData();
    
    return Response.json(instagramData);
}