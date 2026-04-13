package org.springblade.test.secure;

import org.springblade.core.http.HttpRequest;
import org.springblade.core.http.ResponseSpec;
import org.springblade.core.tool.utils.DigestUtil;
import org.springblade.core.tool.utils.StringUtil;

import java.util.UUID;

import static org.springblade.test.secure.SecureTestBuilder.*;

/**
 * Secure安全框架 - 签名认证测试类
 * 测试获取Token以及签名认证（nonce+timestamp）
 *
 * @author BladeX
 */
public class SecureSignTest {

	public static void main(String[] args) {
		// 设置日志级别，方便调试
		initHttpLog();

		printHeader("Secure 签名认证测试");

		// 测试1: 获取Token
		String accessToken = getToken();

		// 测试2: 使用Token调用受保护API
		if (StringUtil.isNotBlank(accessToken)) {
			testCallApiWithToken(accessToken);
		}

		// 测试3: 签名认证（nonce+timestamp）
		testSignAuth();

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
	 * 测试签名认证（nonce+timestamp）
	 * 签名规则: signature = SHA1(timestamp + nonce)
	 */
	private static void testSignAuth() {
		printSection(3, "签名认证 (nonce + timestamp)");

		try {
			// 1. 生成签名参数
			String timestamp = String.valueOf(System.currentTimeMillis());
			String nonce = UUID.randomUUID().toString().replace("-", "");
			String signature = DigestUtil.sha1Hex(timestamp + nonce);

			System.out.println();
			System.out.println("  Signature Parameters:");
			printKeyValue("  timestamp", timestamp);
			printKeyValue("  nonce", nonce);
			printKeyValue("  signature", signature);
			printKeyValue("  algorithm", "SHA1(timestamp + nonce)");

			// 2. 发送带签名的请求
			String response = HttpRequest.get(BASE_URL + "/blade-test/info/sign")
				.addHeader("Authorization", CLIENT_AUTH)
				.addHeader("Blade-Requested-With", "BladeHttpRequest")
				.addHeader("timestamp", timestamp)
				.addHeader("nonce", nonce)
				.addHeader("signature", signature)
				.execute()
				.onSuccess(ResponseSpec::asString);

			System.out.println();
			printKeyValue("Response", response);
			printSuccess("签名认证请求发送成功");
		} catch (Exception e) {
			printError("签名认证异常 - " + e.getMessage());
			printWarning("如果签名认证接口未配置或不存在会报错，属于正常情况");
			System.out.println();
		}
	}

}
