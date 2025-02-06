interface IRequestBody {
  id: number;
  typeSelectedTasks: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id, typeSelectedTasks } = await readBody<IRequestBody>(event);
    const token = getCookie(event, "tokenFourssan");
    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch("https://fourssan.ru/api/tasks/delete-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ id, typeSelectedTasks }),
    });
    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
