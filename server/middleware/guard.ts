// // middleware/auth.js
import { getRequestHeader, getCookie } from "h3";
const runtimeConfig = useRuntimeConfig();

function validateToken(authToken: any) {
  if (authToken === runtimeConfig.public.adminToken) {
    return true;
  }
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const { pathname } = new URL(url);
  const protectedRoutes = [
    "/api/cells/get-cells-client",
    "/api/cells/get-cells",
  ];

  if (protectedRoutes.includes(pathname)) {
    const authToken = getRequestHeader(event, "Authorization");
    if (!authToken) {
      event.res.statusCode = 401;
      return { error: "Unauthorized" };
    }

    const isTokenValid = validateToken(authToken);
    if (!isTokenValid) {
      event.res.statusCode = 403;
      return { error: "Forbidden" };
    }
  }
});
