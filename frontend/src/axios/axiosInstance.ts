import axios from "axios";

const isServer = typeof window === "undefined";

const baseURL = isServer
  ? "http://backend:8080" // SSR 階段用 Docker container 內的名稱
  : process.env.NEXT_PUBLIC_API_URL; // CSR 階段來自 .env.production，對 browser 是 localhost

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  // if (window.location.pathname !== "/login") {
  //   window.location.href = "/login";
  // }
};

//If accessToken token is expired, refresh it, and prepare for quened requests
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

//Execute quened requests after accessToken token refresh
const onRefreshTokenSuccess = async () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

//Request interceptor
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

//Handle refresh accessToken token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const isSellerRequest = originalRequest.url?.includes("/seller");
      // const isUserRequest = !isSellerRequest; // 若不是 seller，預設為 user

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      isRefreshing = true;

      try {
        const refreshUrl = isSellerRequest
          ? "/api/auth/seller/refresh-token"
          : "/api/auth/user/refresh-token";

        await axios.post(
          `${baseURL}${refreshUrl}`,
          {},
          { withCredentials: true }
        );

        await onRefreshTokenSuccess();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        refreshSubscribers = [];
        handleLogout(); // 登出或清除狀態
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

//! 還沒在刷新中（isRefreshing === false）

// 某支請求如果遇到 401，就自己把 isRefreshing = true，去呼叫一次 /refresh-token。

//! 正在刷新時（isRefreshing === true）

// 新遇到 401 的任何請求都不會再去呼叫 /refresh-token，而是走到那段：

// if (isRefreshing) {
//   return new Promise(resolve => {
//     subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
//   });
// }
// 也就是把重試放到佇列裡，等刷新流程結束後（onRefreshTokenSuccess() 被呼叫時）再一口氣把這些請求都重跑一次。

//! 刷新結束

// 刷新成功 → 呼叫 onRefreshTokenSuccess()，把所有佇列中的請求 callback 都執行一遍，然後清空佇列、把 isRefreshing = false。

// 刷新失敗 → 清空佇列、把 isRefreshing = false，並跳到登入頁。

// 所以，isRefreshing 就是個「全域鎖」：

// 鎖關閉（false）→ 第一支 401 請求可以自己去刷新；

// 鎖打開（true）→ 後續的 401 請求都得排隊等鎖開；
