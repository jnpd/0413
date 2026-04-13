/**
 * BladeX Commercial License Agreement
 * Copyright (c) 2018-2099, https://bladex.cn. All rights reserved.
 * <p>
 * Use of this software is governed by the Commercial License Agreement
 * obtained after purchasing a license from BladeX.
 * <p>
 * 1. This software is for development use only under a valid license
 * from BladeX.
 * <p>
 * 2. Redistribution of this software's source code to any third party
 * without a commercial license is strictly prohibited.
 * <p>
 * 3. Licensees may copyright their own code but cannot use segments
 * from this software for such purposes. Copyright of this software
 * remains with BladeX.
 * <p>
 * Using this software signifies agreement to this License, and the software
 * must not be used for illegal purposes.
 * <p>
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY. The author is
 * not liable for any claims arising from secondary or illegal development.
 * <p>
 * Author: Chill Zhuang (bladejava@qq.com)
 */
package org.springblade.common.config;


import org.springblade.core.launch.constant.AppConstant;
import org.springblade.core.oauth2.endpoint.OAuth2SocialEndpoint;
import org.springblade.core.oauth2.endpoint.OAuth2TokenEndPoint;
import org.springblade.core.secure.provider.HttpMethod;
import org.springblade.core.secure.registry.SecureRegistry;
import org.springblade.core.tool.utils.StringPool;
import org.springblade.modules.auth.endpoint.Oauth2SmsEndpoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Blade配置
 *
 * @author Chill
 */
@Configuration(proxyBeanMethods = false)
public class BladeConfiguration implements WebMvcConfigurer {

	/**
	 * 安全框架配置
	 */
	@Bean
	public SecureRegistry secureRegistry() {
		return new SecureRegistry()
			// 开启认证配置
			.enabled()
			// 令牌严格模式配置
			.strictTokenEnabled()
			// 请求头严格模式配置
			.strictHeaderEnabled()
			// 认证放行配置
			.skipUrls(
				"/blade-auth/**",
				"/blade-system/tenant/info",
				"/blade-flow/process/resource-view",
				"/blade-flow/process/diagram-view",
				"/blade-flow/manager/check-upload",
				"/doc.html",
				"/swagger-ui.html",
				"/static/**",
				"/webjars/**",
				"/swagger-resources/**",
				"/druid/**"
			)
			// 认证鉴权配置
			.authEnabled()
			.addAuthPattern(HttpMethod.ALL, "/blade-chat/message/**", "hasAuth()")
			.addAuthPattern(HttpMethod.POST, "/blade-desk/dashboard/upload", "hasTimeAuth(9, 17)")
			.addAuthPattern(HttpMethod.POST, "/blade-desk/dashboard/submit", "hasAnyRole('administrator', 'admin', 'user')")
			// 基础认证配置
			.basicEnabled()
			.addBasicPattern(HttpMethod.POST, "/blade-desk/dashboard/info", "blade", "blade")
			// 签名认证配置
			.signDisabled()
			.addSignPattern(HttpMethod.POST, "/blade-desk/dashboard/sign", "sha1");
	}

	/**
	 * 跨域配置
	 */
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/cors/**")
			.allowedOriginPatterns("*")
			.allowedHeaders("*")
			.allowedMethods("*")
			.maxAge(3600)
			.allowCredentials(true);
	}

	/**
	 * 给OAuth2服务端添加前缀
	 */
	@Override
	public void configurePathMatch(PathMatchConfigurer configurer) {
		configurer.addPathPrefix(StringPool.SLASH + AppConstant.APPLICATION_AUTH_NAME,
			c -> c.isAnnotationPresent(RestController.class) && (
				OAuth2TokenEndPoint.class.equals(c) || OAuth2SocialEndpoint.class.equals(c) || Oauth2SmsEndpoint.class.equals(c))
		);
	}

}
