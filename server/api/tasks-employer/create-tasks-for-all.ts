interface IRequestBody {
  task: Task;
}

export default defineEventHandler(async (event) => {
  try {
    const { task } = await readBody<IRequestBody>(event);
    const token = getCookie(event, "tokenFourssan");
    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch(
      "https://fourssan.ru/api/tasks/create-tasks-for-all",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ task }),
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
