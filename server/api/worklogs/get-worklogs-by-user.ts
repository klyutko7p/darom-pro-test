interface IRequestBody {
  userId: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await readBody<IRequestBody>(event);
    const token = getCookie(event, "tokenFourssan");
    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch(
      "https://fourssan.ru/api/worklogs/get-worklog-by-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ userId }),
      }
    );
    const data = await response.text();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
