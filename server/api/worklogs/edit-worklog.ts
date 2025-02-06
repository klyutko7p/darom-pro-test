interface IRequestBody {
  id: number;
  data: any;
}

export default defineEventHandler(async (event) => {
  try {
    const { id, data } = await readBody<IRequestBody>(event);
    const token = getCookie(event, "tokenFourssan");
    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch(
      "https://fourssan.ru/api/worklogs/edit-worklog",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ id, data }),
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
