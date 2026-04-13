package org.springblade.test.secure;

import org.springblade.core.http.HttpRequest;
import org.springblade.core.http.ResponseSpec;
import org.springblade.core.tool.utils.StringUtil;

import java.util.Base64;

import static org.springblade.test.secure.SecureTestBuilder.*;

/**
 * Secure安全框架 - 基础认证测试类
 * 测试HTTP Basic Authentication
 *
 * @author BladeX
 */
public class SecureBasicTest {

	/**
	 * Basic认证用户名
	 */
	private static final String BASIC_USERNAME = "admin";

	/**
	 * Basic认证密码
	 */
	private static final String BASIC_PASSWORD = "admin123";

	public static void main(String[] args) {
		// 设置日志级别，方便调试
		initHttpLog();

		printHeader("Secure 基础认证测试");

		// 测试1: 获取Token
		String accessToken = getToken();

		// 测试2: 使用Token调用受保护API
		if (StringUtil.isNotBlank(accessToken)) {
			testCallApiWithToken(accessToken);
		}

		// 测试3: Basic认证调用受保护API
		testBasicAuth();

		printFooter();
	}

	/**
	 * 使用Token调用受保护API
	 *
	 * @param accessToken 访问令牌
	 */
	private static void testCallApiWithToken(String accessToken) {
		printSection(2, "使用 Token 调用受保护 API");
		callApiWithToken("/blade-desk/notice/list", accessToken);
	}

	/**
	 * 测试Basic认证调用受保护API
	 * 认证原理: Authorization: Basic {Base64(username:password)}
	 */
	private static void testBasicAuth() {
		printSection(1, "Basic 认证调用受保护 API");

		try {
			// 1. 生成Basic Auth凭证
			String credentials = BASIC_USERNAME + ":" + BASIC_PASSWORD;
			String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());
			String basicAuth = "Basic " + encoded;

			System.out.println();
			System.out.println("  Basic Auth Parameters:");
			printKeyValue("  username", BASIC_USERNAME);
			printKeyValue("  password", BASIC_PASSWORD);
			printKeyValue("  credentials", credentials);
			printKeyValue("  encoded", encoded);
			printKeyValue("  Authorization", basicAuth);

			// 2. 发送带Basic认证的请求
			String response = HttpRequest.get(BASE_URL + "/blade-test/info/basic")
				.addHeader("Authorization", basicAuth)
				.addHeader("Blade-Requested-With", "BladeHttpRequest")
				.execute()
				.onSuccess(ResponseSpec::asString);

			System.out.println();
			printKeyValue("Response", response);
			printSuccess("Basic 认证请求发送成功");
		} catch (Exception e) {
			printError("Basic 认证异常 - " + e.getMessage());
			printWarning("如果Basic认证接口未配置或不存在会报错，属于正常情况");
			System.out.println();
		}
	}

}
