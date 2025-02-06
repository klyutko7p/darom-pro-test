interface IRequestBody {
  taskId: number;
  isCompleted: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const { taskId, isCompleted } = await readBody<IRequestBody>(event);
    const token = getCookie(event, "tokenFourssan");
    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch(
      "https://fourssan.ru/api/tasks/update-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ taskId, isCompleted }),
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
