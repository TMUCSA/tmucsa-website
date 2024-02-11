async function fetchInstagramData() {
    try {
        const data = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,children{media_url,thumbnail_url}&access_token=${process.env.NEXT_PUBLIC_INSTAGRAM_KEY}`);
        const feed = await data.json();
        return feed.data.slice(0, 13);
    } catch (err) {
        console.error(err);
    }
}

export async function GET() {
    const instagramData = await fetchInstagramData();
    
    return Response.json(instagramData);
}