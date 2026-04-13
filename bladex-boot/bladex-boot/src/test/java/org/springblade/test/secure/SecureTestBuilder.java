package org.springblade.test.secure;

import org.springblade.core.http.HttpRequest;
import org.springblade.core.http.LogLevel;
import org.springblade.core.http.ResponseSpec;
import org.springblade.core.tool.jackson.JsonUtil;
import org.springblade.core.tool.utils.StringUtil;

import java.util.Map;

/**
 * Secure安全框架测试工具类
 * 提供通用的Token获取、API调用及打印辅助方法
 *
 * @author BladeX
 */
public class SecureTestBuilder {

	/**
	 * 分隔线
	 */
	public static final String LINE = "─".repeat(60);
	public static final String DOUBLE_LINE = "═".repeat(60);

	/**
	 * 服务地址
	 */
	public static final String BASE_URL = "http://localhost";

	/**
	 * 客户端认证信息 (saber3:saber3_secret 的 Base64 编码)
	 */
	public static final String CLIENT_AUTH = "Basic c2FiZXIzOnNhYmVyM19zZWNyZXQ=";

	/**
	 * 租户ID
	 */
	public static final String TENANT_ID = "000000";

	/**
	 * 用户名
	 */
	public static final String USERNAME = "admin";

	/**
	 * 密码（国密加密后的字符串,具体见 @org.springblade.test.sm.Sm2Test）
	 */
	public static final String PASSWORD = "";

	/**
	 * 初始化HTTP日志级别
	 */
	public static void initHttpLog() {
		HttpRequest.setGlobalLog(LogLevel.BODY);
	}

	/**
	 * 打印测试头部
	 *
	 * @param title 测试标题
	 */
	public static void printHeader(String title) {
		System.out.println();
		System.out.println(DOUBLE_LINE);
		System.out.println("  " + title);
		System.out.println(DOUBLE_LINE);
		System.out.println();
	}

	/**
	 * 打印测试尾部
	 */
	public static void printFooter() {
		System.out.println(DOUBLE_LINE);
		System.out.println("  测试执行完毕");
		System.out.println(DOUBLE_LINE);
	}

	/**
	 * 打印测试章节
	 *
	 * @param testNo 测试编号
	 * @param title  章节标题
	 */
	public static void printSection(int testNo, String title) {
		System.out.println(LINE);
		System.out.printf("  [TEST-%d] %s%n", testNo, title);
		System.out.println(LINE);
	}

	/**
	 * 打印键值对
	 *
	 * @param key   键
	 * @param value 值
	 */
	public static void printKeyValue(String key, Object value) {
		System.out.printf("  %-16s: %s%n", key, value);
	}

	/**
	 * 打印成功消息
	 *
	 * @param message 消息内容
	 */
	public static void printSuccess(String message) {
		System.out.printf("%n  [SUCCESS] %s%n%n", message);
	}

	/**
	 * 打印错误消息
	 *
	 * @param message 消息内容
	 */
	public static void printError(String message) {
		System.out.printf("%n  [FAILED] %s%n%n", message);
	}

	/**
	 * 打印警告消息
	 *
	 * @param message 消息内容
	 */
	public static void printWarning(String message) {
		System.out.printf("  [WARN] %s%n", message);
	}

	/**
	 * 获取Token
	 * 通用方法，供签名认证等场景复用
	 *
	 * @return accessToken，获取失败返回null
	 */
	public static String getToken() {
		printSection(1, "获取 Token");

		try {
			String response = HttpRequest.post(BASE_URL + "/blade-auth/oauth/token")
				.addHeader("Authorization", CLIENT_AUTH)
				.addHeader("Content-Type", "application/x-www-form-urlencoded")
				.formBuilder()
				.add("grant_type", "password")
				.add("tenant_id", TENANT_ID)
				.add("username", USERNAME)
				.add("password", PASSWORD)
				.execute()
				.onSuccess(ResponseSpec::asString);

			System.out.println();
			printKeyValue("Response", response);

			if (StringUtil.isNotBlank(response)) {
				Map<String, Object> result = JsonUtil.readMap(response, String.class, Object.class);
				if (result != null && result.containsKey("access_token")) {
					String accessToken = (String) result.get("access_token");
					String tokenType = (String) result.get("token_type");
					Object expiresIn = result.get("expires_in");

					System.out.println();
					System.out.println("  Token Details:");
					printKeyValue("  token_type", tokenType);
					printKeyValue("  access_token", accessToken.substring(0, Math.min(50, accessToken.length())) + "...");
					printKeyValue("  expires_in", expiresIn + " seconds");

					printSuccess("Token 获取成功");
					return accessToken;
				} else {
					printError("Token 获取失败 - " + result);
				}
			}
		} catch (Exception e) {
			printError("Token 获取异常 - " + e.getMessage());
		}

		return null;
	}

	/**
	 * 使用Token调用受保护API
	 *
	 * @param url         API地址（相对路径，如 /blade-desk/notice/list）
	 * @param accessToken 访问令牌
	 */
	public static void callApiWithToken(String url, String accessToken) {
		try {
			String response = HttpRequest.get(BASE_URL + url)
				.addHeader("Authorization", CLIENT_AUTH)
				.addHeader("Blade-Auth", "bearer " + accessToken)
				.addHeader("Blade-Requested-With", "BladeHttpRequest")
				.execute()
				.onSuccess(ResponseSpec::asString);

			System.out.println();
			printKeyValue("Response", response);
			printSuccess("API 调用成功");
		} catch (Exception e) {
			printError("API 调用异常 - " + e.getMessage());
			printWarning("如果接口不存在会返回 404，属于正常情况");
			System.out.println();
		}
	}

}
