import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  link: string;
}
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { link } = await readBody<IRequestBody>(event);
    let productId = link.split("/");

    let apiUrl =
      "https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=/product/" +
      productId[4];

    let headers = {
      cookie:
        "__Secure-ETC=5666d9724b2e56001cad77f9932d9edb; __Secure-access-token=5.0.6VNcTLBkQJKpjZz-MTIYCw.47.AV8v99DjCi80LvfPr8CniERaj10-C-rMtDKXJVf3unrO_LfYPtLU9stM-2inJDtoLQ..20240816000159.KSKcQm3zc3AnfsFHJXkPKUsKhfmdqBQuNTsORiLv-wU.197223be6418b226e; __Secure-refresh-token=5.0.6VNcTLBkQJKpjZz-MTIYCw.47.AV8v99DjCi80LvfPr8CniERaj10-C-rMtDKXJVf3unrO_LfYPtLU9stM-2inJDtoLQ..20240816000159.AQp7DxK2P_27zpCL8Qrt-8eqPfmowwtgMmSiUtrqOJc.18e4c1f81a28d091e; __Secure-user-id=0; __Secure-ab-group=47; xcid=5f3f6a4c2dec6b5e8af033b1c510dd0f; __Secure-ext_xcid=5f3f6a4c2dec6b5e8af033b1c510dd0f; abt_data=c8b271483804877edb8a224ab2e2e7dc:f8c42d0dae4fa65f9530f01ca5b38f24ca58d2e14fe6398ae983eda4fc1d2a6ecb4f8d4240e5d99e1d5ff475b7987bb987f7340f81dbc6e81892f96c9a5326c92cbc2d1a1dc4cbaef059adbdf390884aa655c34c87862978c9e41eefe38532671024f68241a27d856bf2066d17fed781931d1b4351399d2ccbed35d135068ced1d79d0bbee4ab2e18d42881b62eaa8e26ce405c74683dfbe280a5eebbac2a4333c9e722789cc8dc98de531917b50f8f9eb5e44c67432f0f1a3d996429c853109bf675c85230f57f260cddc05d0df5228b98f413ca12e4fbe6cce8cc1264bf609",
      priority: "u=0, i",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    };

    let queryJson = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .catch((error) => console.error("Error:", error));

    return queryJson;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
