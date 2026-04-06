import { API_CONFIG, ApiResponse, HTTP_STATUS } from './config';

// Token管理
const TOKEN_KEY = 'access_token';

class HttpClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // 获取Token
  private getToken(): string | null {
    return wx.getStorageSync(TOKEN_KEY) || null;
  }

  // 设置Token
  public setToken(token: string): void {
    wx.setStorageSync(TOKEN_KEY, token);
  }

  // 清除Token
  public clearToken(): void {
    wx.removeStorageSync(TOKEN_KEY);
  }

  // 通用请求方法
  private request<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
    header: any = {}
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const token = this.getToken();

      // 构建请求头
      const requestHeader: any = {
        'Content-Type': 'application/json',
        ...header
      };

      // 添加认证Token
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`;
      }

      wx.request({
        url: `${this.baseUrl}${url}`,
        method,
        data,
        header: requestHeader,
        timeout: API_CONFIG.TIMEOUT,
        success: (res: any) => {
          const response = res.data as ApiResponse<T>;

          // 处理业务状态码
          if (response.code === HTTP_STATUS.SUCCESS) {
            resolve(response);
          } else if (response.code === HTTP_STATUS.UNAUTHORIZED) {
            // Token失效，清除并跳转登录
            this.clearToken();
            wx.showToast({
              title: '登录已过期',
              icon: 'none'
            });
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/register/register'
              });
            }, 1500);
            reject(new Error('登录已过期'));
          } else {
            // 其他错误
            wx.showToast({
              title: response.message || '请求失败',
              icon: 'none'
            });
            reject(new Error(response.message || '请求失败'));
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  }

  // GET请求
  public get<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'GET', data);
  }

  // POST请求
  public post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'POST', data);
  }

  // PUT请求
  public put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'PUT', data);
  }

  // DELETE请求
  public delete<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'DELETE', data);
  }
}

// 导出单例
export const http = new HttpClient();
