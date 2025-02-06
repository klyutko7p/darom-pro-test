interface IRequestBody {
  usersId: number[];
  worklogData: WorkLog;
}

export default defineEventHandler(async (event) => {
    try {
      const { usersId, worklogData } = await readBody<IRequestBody>(event);
      const token = getCookie(event, "tokenFourssan");
      const cookieHeader = token ? `tokenFourssan=${token}` : "";
  
      const response = await fetch(
        "https://fourssan.ru/api/worklogs/create-worklogs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          body: JSON.stringify({ usersId, worklogData }),
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