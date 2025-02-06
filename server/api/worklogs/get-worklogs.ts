import { defineEventHandler, getCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, "tokenFourssan");

    const cookieHeader = token ? `tokenFourssan=${token}` : "";

    const response = await fetch(
      "https://fourssan.ru/api/worklogs/get-worklogs",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
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
