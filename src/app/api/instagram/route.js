// async function fetchInstagramData() {
//     const API_KEY = process.env.INSTAGRAM_KEY;
    
//     try {
//         const data = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,children{media_url,thumbnail_url}&access_token=${API_KEY}&limit=13`);
//         const feed = await data.json();
//         return feed.data;
//     } catch (err) {
//         console.error(err);
//     }
// }

// export async function GET() {
//     return Response.json(await fetchInstagramData(), {
//         status: 200,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });
// }