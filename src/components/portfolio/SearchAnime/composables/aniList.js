const url = 'https://graphql.anilist.co';

// 定義我們要抓取的資料結構 (GraphQL Query)
const query = `
query ($search: String) {
  Page(perPage: 10) {
    media(search: $search, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
      large
        medium
        color
      }
      bannerImage
      description
      episodes
      seasonYear
      genres
      averageScore
    }
  }
}
`;

export async function fetchAnime(searchText) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: { search: searchText }
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.data.Page.media; // 回傳動畫陣列
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}