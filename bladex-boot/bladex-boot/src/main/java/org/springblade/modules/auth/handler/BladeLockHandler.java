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
package org.springblade.modules.auth.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springblade.common.cache.CacheNames;
import org.springblade.common.cache.ParamCache;
import org.springblade.core.oauth2.exception.ExceptionCode;
import org.springblade.core.oauth2.provider.OAuth2Validation;
import org.springblade.core.redis.cache.BladeRedis;
import org.springblade.core.tool.utils.Func;
import org.springblade.core.tool.utils.WebUtil;

import java.time.Duration;

import static org.springblade.modules.auth.constant.BladeAuthConstant.FAIL_COUNT;
import static org.springblade.modules.auth.constant.BladeAuthConstant.FAIL_COUNT_VALUE;

/**
 * 失败锁定处理器
 * 统一管理账号锁定和IP锁定逻辑
 *
 * @author BladeX
 */
@Slf4j
@RequiredArgsConstructor
public class BladeLockHandler {

	private final BladeRedis bladeRedis;

	/**
	 * 锁定时长（分钟）
	 */
	private static final int LOCK_DURATION_MINUTES = 30;

	/**
	 * 校验账号是否锁定
	 *
	 * @param tenantId 租户id
	 * @param account  账号
	 * @return OAuth2Validation
	 */
	public OAuth2Validation validateAccountLock(String tenantId, String account) {
		int cnt = getAccountFailCount(tenantId, account);
		int failCount = getFailCountThreshold();
		if (cnt >= failCount) {
			log.error("用户：{}，已锁定，请求ip：{}", account, WebUtil.getIP());
			return buildValidationFailure();
		}
		return new OAuth2Validation();
	}

	/**
	 * 校验IP是否锁定
	 *
	 * @param tenantId 租户id
	 * @return OAuth2Validation
	 */
	public OAuth2Validation validateIpLock(String tenantId) {
		String clientIp = WebUtil.getIP();
		int cnt = getIpFailCount(tenantId, clientIp);
		int failCount = getFailCountThreshold();
		if (cnt >= failCount) {
			log.error("IP：{}，已锁定", clientIp);
			return buildValidationFailure();
		}
		return new OAuth2Validation();
	}

	/**
	 * 增加账号错误次数
	 *
	 * @param tenantId 租户id
	 * @param account  账号
	 */
	public void addAccountFailCount(String tenantId, String account) {
		if (Func.hasEmpty(tenantId, account)) {
			return;
		}
		int count = getAccountFailCount(tenantId, account);
		String cacheKey = CacheNames.tenantKey(tenantId, CacheNames.ACCOUNT_FAIL_KEY, account);
		bladeRedis.setEx(cacheKey, count + 1, Duration.ofMinutes(LOCK_DURATION_MINUTES));
	}

	/**
	 * 增加IP错误次数
	 *
	 * @param tenantId 租户id
	 */
	public void addIpFailCount(String tenantId) {
		String clientIp = WebUtil.getIP();
		if (Func.hasEmpty(tenantId, clientIp)) {
			return;
		}
		int count = getIpFailCount(tenantId, clientIp);
		String cacheKey = CacheNames.tenantKey(tenantId, CacheNames.IP_FAIL_KEY, clientIp);
		bladeRedis.setEx(cacheKey, count + 1, Duration.ofMinutes(LOCK_DURATION_MINUTES));
	}

	/**
	 * 清空账号错误次数
	 *
	 * @param tenantId 租户id
	 * @param account  账号
	 */
	public void clearAccountFailCount(String tenantId, String account) {
		if (Func.hasEmpty(tenantId, account)) {
			return;
		}
		String cacheKey = CacheNames.tenantKey(tenantId, CacheNames.ACCOUNT_FAIL_KEY, account);
		bladeRedis.del(cacheKey);
	}

	/**
	 * 清空IP错误次数
	 *
	 * @param tenantId 租户id
	 */
	public void clearIpFailCount(String tenantId) {
		String clientIp = WebUtil.getIP();
		if (Func.hasEmpty(tenantId, clientIp)) {
			return;
		}
		String cacheKey = CacheNames.tenantKey(tenantId, CacheNames.IP_FAIL_KEY, clientIp);
		bladeRedis.del(cacheKey);
	}

	/**
	 * 处理认证失败
	 * 同时增加账号和IP错误次数
	 *
	 * @param tenantId 租户id
	 * @param account  账号
	 */
	public void handleAuthFailure(String tenantId, String account) {
		addAccountFailCount(tenantId, account);
		addIpFailCount(tenantId);
	}

	/**
	 * 处理认证成功
	 * 同时清空账号和IP错误次数
	 *
	 * @param tenantId 租户id
	 * @param account  账号
	 */
	public void handleAuthSuccess(String tenantId, String account) {
		clearAccountFailCount(tenantId, account);
		clearIpFailCount(tenantId);
	}

	/**
	 * 获取账号错误次数
	 *
	 * @param tenantId 租户id
	 * @param account  账号
	 * @return int
	 */
	private int getAccountFailCount(String tenantId, String account) {
		if (Func.hasEmpty(tenantId, account)) {
			return 0;
		}
		String cacheKey = CacheNames.tenantKey(tenantId, CacheNames.ACCOUNT_FAIL_KEY, account);
		return Func.toInt(bladeRedis.get(cacheKey), 0);
	}

	/**
	 * 获取IP错误次数
	 *
	 * @param tenantId 租户id
	 * @param clientIp 客户端IP
	 * @return int
	 */
	private int getIpFailCount(String tenantId, String clientIp) {
		if (Func.hasEmpty(tenantId, clientIp)) {
			return 0;
		}
		String cacheKey = CacheNames.tenantKey(tenantId, CacheNames.IP_FAIL_KEY, clientIp);
		return Func.toInt(bladeRedis.get(cacheKey), 0);
	}

	/**
	 * 获取失败次数阈值
	 *
	 * @return int
	 */
	private int getFailCountThreshold() {
		return Func.toInt(ParamCache.getValue(FAIL_COUNT_VALUE), FAIL_COUNT);
	}

	/**
	 * 构建校验失败结果
	 *
	 * @return OAuth2Validation
	 */
	private OAuth2Validation buildValidationFailure() {
		OAuth2Validation validation = new OAuth2Validation();
		validation.setSuccess(false);
		validation.setCode(ExceptionCode.USER_TOO_MANY_FAILS.getCode());
		validation.setMessage(ExceptionCode.USER_TOO_MANY_FAILS.getMessage());
		return validation;
	}
}
