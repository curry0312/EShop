import Cookies from "js-cookie";

export const getAccessToken = ({ role }: { role: "user" | "seller" }) => {
  if (role === "user") {
    const accessToken = Cookies.get("accessToken");
    console.log("accessToken", accessToken);
    return accessToken;
  }
  if (role === "seller") {
    // const accessToken = Cookies.get("seller-accessToken");
    const accessToken = Cookies.get("seller-accessToken");
    console.log("accessToken", accessToken);
    return accessToken;
  }
};
