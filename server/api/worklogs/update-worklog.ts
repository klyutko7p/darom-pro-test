interface IRequestBody {
  id: number;
  day: number;
  hours: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id, day, hours } = await readBody<IRequestBody>(event);
    const token = getCookie(event, "tokenFourssan");
    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch(
      "https://fourssan.ru/api/worklogs/update-worklog",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ id, day, hours }),
      }
    );
    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
