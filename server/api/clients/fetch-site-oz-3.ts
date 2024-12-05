interface IRequestBody {
  link: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { link } = await readBody<IRequestBody>(event);
    const requestData = {
      url: link,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    const response = await fetch(
      "https://telegram-ozon-fetch-2f37fc572ca9.herokuapp.com/parse",
      options
    );
    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
