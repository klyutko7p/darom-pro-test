interface IRequestBody {
  id: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody<IRequestBody>(event);
    const token = getCookie(event, "tokenFourssan");
    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch(
      "https://fourssan.ru/api/worklogs/delete-worklog",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ id }),
      }
    );
    const dataV = await response.json();

    return dataV;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
